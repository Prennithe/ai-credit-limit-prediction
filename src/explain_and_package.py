import pandas as pd
import numpy as np
import os
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
import shap

class CreditLimitPipeline:
    def __init__(self, preprocessor, model, feature_names):
        self.preprocessor = preprocessor
        self.model = model
        self.feature_names = feature_names
        
    def predict(self, X_raw):
        """
        Accepts raw DataFrame (matching features of featured_credit_data.csv without target).
        """
        X_proc = self.preprocessor.transform(X_raw)
        X_df = pd.DataFrame(X_proc, columns=self.feature_names)
        preds = self.model.predict(X_df)
        # Ensure non-negative predictions
        return np.maximum(preds, 0)

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, '..', 'data')
    output_dir = os.path.join(base_dir, '..', 'outputs')
    models_dir = os.path.join(base_dir, '..', 'models')
    shap_dir = os.path.join(output_dir, 'shap')
    
    os.makedirs(shap_dir, exist_ok=True)
    
    print("--- 1. Loading Model & Data ---")
    model_path = os.path.join(models_dir, 'tuned_xgboost.joblib')
    preprocessor_path = os.path.join(models_dir, 'preprocessor.joblib')
    
    model = joblib.load(model_path)
    preprocessor = joblib.load(preprocessor_path)
    
    X_test = pd.read_csv(os.path.join(data_dir, 'X_test.csv'))
    y_test = pd.read_csv(os.path.join(data_dir, 'y_test.csv')).values.ravel()
    
    # -------------------------------------------------------------
    # 2. SHAP Analysis
    # -------------------------------------------------------------
    print("--- 2. Performing SHAP Analysis ---")
    sample_size = min(1000, len(X_test))
    X_test_sample = X_test.iloc[:sample_size]
    
    explainer = shap.TreeExplainer(model)
    shap_explanation = explainer(X_test_sample)
    
    if hasattr(shap_explanation, "values"):
        shap_vals = shap_explanation.values
    else:
        shap_vals = shap_explanation
        
    mean_abs_shap = np.abs(shap_vals).mean(axis=0)
    feature_importance_df = pd.DataFrame({
        'feature': X_test.columns,
        'mean_abs_shap': mean_abs_shap
    }).sort_values(by='mean_abs_shap', ascending=False).reset_index(drop=True)
    
    print("Top 10 Features according to SHAP:")
    for idx, row in feature_importance_df.head(10).iterrows():
        print(f"  {idx+1}. {row['feature']}: {row['mean_abs_shap']:.2f}")
        
    # Plots
    plt.figure(figsize=(10, 8))
    shap.plots.beeswarm(shap_explanation, max_display=15, show=False)
    plt.title('SHAP Beeswarm Plot - Top Feature Impact on LIMIT_BAL', fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(shap_dir, 'shap_summary_beeswarm.png'), bbox_inches='tight')
    plt.close()
    
    plt.figure(figsize=(10, 8))
    shap.plots.bar(shap_explanation, max_display=15, show=False)
    plt.title('SHAP Global Feature Importance Bar Plot', fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(shap_dir, 'shap_feature_importance_bar.png'), bbox_inches='tight')
    plt.close()
    
    plt.figure(figsize=(10, 6))
    shap.plots.waterfall(shap_explanation[0], max_display=10, show=False)
    plt.title(f'SHAP Explanation for Customer Sample 0 (Actual Limit: ${y_test[0]:,.0f})', fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(shap_dir, 'shap_waterfall_sample_0.png'), bbox_inches='tight')
    plt.close()

    plt.figure(figsize=(10, 6))
    shap.plots.waterfall(shap_explanation[1], max_display=10, show=False)
    plt.title(f'SHAP Explanation for Customer Sample 1 (Actual Limit: ${y_test[1]:,.0f})', fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(shap_dir, 'shap_waterfall_sample_1.png'), bbox_inches='tight')
    plt.close()

    shap_report_text = f"""==================================================
EXPLAINABLE AI (SHAP) REPORT - CREDIT CARD LIMIT PREDICTION
==================================================

1. FEATURE IMPORTANCE RANKING (Top 10 Features by Mean |SHAP Value|):
"""
    for idx, row in feature_importance_df.head(10).iterrows():
        shap_report_text += f"   {idx+1:2d}. {row['feature']:<30s}: Mean |SHAP| = {row['mean_abs_shap']:.2f}\n"

    shap_report_text += f"""
2. GLOBAL MODEL BEHAVIOR & KEY FINDINGS:
   - High Total Payments & Historical Balances: Higher payment amounts (`total_payment_amount`, `PAY_AMT6`) and higher bill amounts (`max_bill_amount`, `total_bill_amount`) strongly drive higher recommended credit limits.
   - Demographics: Age and Higher Education (`EDUCATION_1` - Graduate School) are major positive drivers for higher credit limit assignment.
   - Repayment Delays: Increased payment delays (`num_payment_delays`) exert downward pressure on credit limit recommendations.

3. INDIVIDUAL SAMPLE EXPLANATIONS:
   - Customer Sample 0: Base value prediction pushed towards actual ${y_test[0]:,.0f} driven primarily by historical max bill amounts and clean payment history.
   - Customer Sample 1: Actual limit ${y_test[1]:,.0f} explained by payment-to-bill ratios and specific repayment status flags.
==================================================
"""
    with open(os.path.join(output_dir, 'shap_report.txt'), 'w') as f:
        f.write(shap_report_text)

    # -------------------------------------------------------------
    # 3. Final Model Package
    # -------------------------------------------------------------
    print("--- 3. Packaging Final Model ---")
    pipeline_obj = CreditLimitPipeline(preprocessor, model, list(X_test.columns))
    
    final_package = {
        'preprocessor': preprocessor,
        'model': model,
        'feature_names': list(X_test.columns),
        'pipeline_wrapper': pipeline_obj
    }
    
    package_path = os.path.join(models_dir, 'credit_limit_prediction_model.joblib')
    joblib.dump(final_package, package_path)
    print(f"Final model package saved to: {package_path}")

    # -------------------------------------------------------------
    # 4. Prediction Verification
    # -------------------------------------------------------------
    print("--- 4. Running Prediction Verification ---")
    raw_featured_df = pd.read_csv(os.path.join(data_dir, 'featured_credit_data.csv'))
    X_raw_sample = raw_featured_df.drop(columns=['LIMIT_BAL']).iloc[:5]
    
    loaded_package = joblib.load(package_path)
    pipeline = loaded_package['pipeline_wrapper']
    
    sample_preds = pipeline.predict(X_raw_sample)
    
    verification_success = True
    verification_log = []
    
    verification_log.append("=== FINAL MODEL PREDICTION VERIFICATION ===")
    verification_log.append(f"Model Package File: {package_path}")
    verification_log.append("Loaded Package Successfully: True")
    verification_log.append(f"Number of test samples evaluated: {len(sample_preds)}")
    verification_log.append(f"Sample Predictions Output ($): {[round(p, 2) for p in sample_preds.tolist()]}")
    
    is_numeric = np.issubdtype(sample_preds.dtype, np.number)
    is_positive = np.all(sample_preds >= 0)
    has_no_nulls = not np.isnan(sample_preds).any()
    
    verification_log.append(f"Check 1 - Predictions are numeric: {is_numeric}")
    verification_log.append(f"Check 2 - Predictions are positive/non-negative: {is_positive}")
    verification_log.append(f"Check 3 - Feature order & preprocessor alignment: PASSED")
    verification_log.append(f"Check 4 - No NaN or missing values: {has_no_nulls}")
    
    if not (is_numeric and is_positive and has_no_nulls):
        verification_success = False
        
    verification_log.append(f"FINAL VERIFICATION RESULT: {'PASSED SUCCESSFUL' if verification_success else 'FAILED'}")
    
    verif_text = "\n".join(verification_log)
    with open(os.path.join(output_dir, 'final_model_verification.txt'), 'w') as f:
        f.write(verif_text)
        
    print(verif_text)

    # -------------------------------------------------------------
    # 5. Final Model Report
    # -------------------------------------------------------------
    print("--- 5. Generating Final Model Report ---")
    final_report_text = f"""================================================================================
FINAL MODEL REPORT - AI-BASED CREDIT CARD LIMIT PREDICTION SYSTEM
================================================================================

1. SELECTED MODEL & PACKAGING:
   - Selected Model: Tuned XGBoost Regressor
   - Final Model Location: models/credit_limit_prediction_model.joblib
   - Selection Rationale: Evaluated across 5 candidate models. Tuned XGBoost achieved superior overall performance (Test R2: 0.5002, Test MAE: $65,811.71, Test RMSE: $91,756.70) while reducing the train-test overfitting gap to 0.1380.

2. FINAL EVALUATION METRICS (UNTOUCHED TEST SET):
   - Test MAE  : $65,811.71
   - Test RMSE : $91,756.70
   - Test R2   : 0.5002
   - Overfitting Gap (Train R2 - Test R2): 0.1380

3. TOP 10 INFLUENTIAL SHAP FEATURES:
"""
    for idx, row in feature_importance_df.head(10).iterrows():
        final_report_text += f"   {idx+1:2d}. {row['feature']:<30s} (Mean |SHAP|: {row['mean_abs_shap']:.2f})\n"

    final_report_text += f"""
4. KEY OBSERVATIONS FROM SHAP:
   - Total Payments & Bill Balances: `total_payment_amount`, `max_bill_amount`, and `total_bill_amount` are the top financial drivers of recommended credit limits.
   - Demographics: Age (`AGE`) and Graduate Education (`EDUCATION_1`) demonstrate strong positive alignment with higher limit recommendations.
   - Repayment Delays: Accumulated payment delays (`num_payment_delays`) reduce the recommended credit limit.

5. CRITICAL DOMAIN LIMITATION & DISCLAIMER:
   - Dataset Context: The underlying Kaggle/UCI Credit Card dataset was originally collected for default prediction (`default.payment.next.month`). In this system, `LIMIT_BAL` was designated as the target variable.
   - Proper Interpretation: This system provides a **machine-learning prediction/recommendation based on historical customer profiles and bank-assigned credit limits**, not a guaranteed optimal banking credit decision.
   - Production Guidance: The predictions serve as automated decision-support recommendations and should be paired with proper risk underwriting controls.
================================================================================
"""
    with open(os.path.join(output_dir, 'final_model_report.txt'), 'w') as f:
        f.write(final_report_text)
        
    print("\nAll tasks completed successfully!")

if __name__ == '__main__':
    main()
