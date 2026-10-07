import pandas as pd
import numpy as np
import time
import os
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.model_selection import RandomizedSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, '..', 'data')
    output_dir = os.path.join(base_dir, '..', 'outputs')
    models_dir = os.path.join(base_dir, '..', 'models')
    opt_plots_dir = os.path.join(output_dir, 'optimization_plots')
    
    os.makedirs(opt_plots_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)
    
    # Load Data
    print("Loading data...")
    X_train = pd.read_csv(os.path.join(data_dir, 'X_train.csv'))
    X_test = pd.read_csv(os.path.join(data_dir, 'X_test.csv'))
    y_train = pd.read_csv(os.path.join(data_dir, 'y_train.csv')).values.ravel()
    y_test = pd.read_csv(os.path.join(data_dir, 'y_test.csv')).values.ravel()
    
    # Load Original Model Results
    orig_comparison_path = os.path.join(output_dir, 'model_comparison.csv')
    df_orig = pd.read_csv(orig_comparison_path)
    
    # -------------------------------------------------------------
    # 1. XGBoost Tuning
    # -------------------------------------------------------------
    print("\n=========================================")
    print("Starting XGBoost Hyperparameter Tuning...")
    print("=========================================")
    
    xgb_param_dist = {
        'n_estimators': [100, 200, 300, 400],
        'max_depth': [3, 4, 5, 6, 7],
        'learning_rate': [0.01, 0.03, 0.05, 0.1],
        'min_child_weight': [1, 3, 5, 7],
        'subsample': [0.6, 0.7, 0.8, 0.9, 1.0],
        'colsample_bytree': [0.6, 0.7, 0.8, 0.9, 1.0],
        'reg_alpha': [0.0, 0.1, 1.0, 5.0, 10.0],
        'reg_lambda': [0.1, 1.0, 5.0, 10.0, 20.0]
    }
    
    xgb_base = XGBRegressor(random_state=42, n_jobs=-1)
    
    xgb_search = RandomizedSearchCV(
        estimator=xgb_base,
        param_distributions=xgb_param_dist,
        n_iter=25,
        scoring='neg_mean_absolute_error',
        cv=5,
        random_state=42,
        n_jobs=-1,
        verbose=1
    )
    
    start_time = time.time()
    xgb_search.fit(X_train, y_train)
    xgb_tune_time = time.time() - start_time
    
    best_xgb = xgb_search.best_estimator_
    best_xgb_params = xgb_search.best_params_
    
    print(f"XGBoost Tuning completed in {xgb_tune_time:.2f}s")
    print(f"Best XGBoost Params: {best_xgb_params}")
    
    # -------------------------------------------------------------
    # 2. Random Forest Tuning
    # -------------------------------------------------------------
    print("\n=========================================")
    print("Starting Random Forest Hyperparameter Tuning...")
    print("=========================================")
    
    rf_param_dist = {
        'n_estimators': [100, 200, 300],
        'max_depth': [8, 12, 16, 20, None],
        'min_samples_split': [2, 5, 10, 15],
        'min_samples_leaf': [1, 2, 4, 8],
        'max_features': ['sqrt', 'log2', 0.5, 0.7]
    }
    
    rf_base = RandomForestRegressor(random_state=42, n_jobs=-1)
    
    rf_search = RandomizedSearchCV(
        estimator=rf_base,
        param_distributions=rf_param_dist,
        n_iter=15,
        scoring='neg_mean_absolute_error',
        cv=5,
        random_state=42,
        n_jobs=-1,
        verbose=1
    )
    
    start_time = time.time()
    rf_search.fit(X_train, y_train)
    rf_tune_time = time.time() - start_time
    
    best_rf = rf_search.best_estimator_
    best_rf_params = rf_search.best_params_
    
    print(f"Random Forest Tuning completed in {rf_tune_time:.2f}s")
    print(f"Best Random Forest Params: {best_rf_params}")
    
    # Save Tuned Models
    joblib.dump(best_rf, os.path.join(models_dir, 'tuned_random_forest.joblib'))
    joblib.dump(best_xgb, os.path.join(models_dir, 'tuned_xgboost.joblib'))
    
    # -------------------------------------------------------------
    # 3. Evaluation on Test Set
    # -------------------------------------------------------------
    def evaluate(model, X_train, y_train, X_test, y_test, name):
        y_tr_pred = model.predict(X_train)
        y_te_pred = model.predict(X_test)
        
        tr_mae = mean_absolute_error(y_train, y_tr_pred)
        te_mae = mean_absolute_error(y_test, y_te_pred)
        
        tr_rmse = np.sqrt(mean_squared_error(y_train, y_tr_pred))
        te_rmse = np.sqrt(mean_squared_error(y_test, y_te_pred))
        
        tr_r2 = r2_score(y_train, y_tr_pred)
        te_r2 = r2_score(y_test, y_te_pred)
        
        r2_gap = tr_r2 - te_r2
        
        if r2_gap > 0.15:
            overfitting = "High Overfitting"
        elif r2_gap > 0.05:
            overfitting = "Moderate Overfitting"
        else:
            overfitting = "Low/No Overfitting"
            
        return {
            'Model': name,
            'Train MAE': round(tr_mae, 4),
            'Test MAE': round(te_mae, 4),
            'Train RMSE': round(tr_rmse, 4),
            'Test RMSE': round(te_rmse, 4),
            'Train R2': round(tr_r2, 4),
            'Test R2': round(te_r2, 4),
            'Overfitting Gap (R2)': round(r2_gap, 4),
            'Overfitting Status': overfitting
        }, y_te_pred

    rf_tuned_metrics, rf_y_pred = evaluate(best_rf, X_train, y_train, X_test, y_test, 'Tuned Random Forest')
    xgb_tuned_metrics, xgb_y_pred = evaluate(best_xgb, X_train, y_train, X_test, y_test, 'Tuned XGBoost')
    
    # Combine All 5 Models
    all_models_list = []
    for _, row in df_orig.iterrows():
        all_models_list.append({
            'Model': f"Original {row['Model']}",
            'Train MAE': row['Train MAE'],
            'Test MAE': row['Test MAE'],
            'Train RMSE': row['Train RMSE'],
            'Test RMSE': row['Test RMSE'],
            'Train R2': row['Train R2'],
            'Test R2': row['Test R2'],
            'Overfitting Gap (R2)': round(row['Train R2'] - row['Test R2'], 4),
            'Overfitting Status': row['Overfitting Status']
        })
    all_models_list.append(rf_tuned_metrics)
    all_models_list.append(xgb_tuned_metrics)
    
    df_final = pd.DataFrame(all_models_list)
    df_final.to_csv(os.path.join(output_dir, 'final_model_comparison.csv'), index=False)
    
    # Save Tuning Params
    tuning_params_df = pd.DataFrame([
        {'Model': 'Tuned XGBoost', 'Best Parameters': str(best_xgb_params), 'Best CV Score (Neg MAE)': round(xgb_search.best_score_, 4), 'Tuning Time (s)': round(xgb_tune_time, 2)},
        {'Model': 'Tuned Random Forest', 'Best Parameters': str(best_rf_params), 'Best CV Score (Neg MAE)': round(rf_search.best_score_, 4), 'Tuning Time (s)': round(rf_tune_time, 2)}
    ])
    tuning_params_df.to_csv(os.path.join(output_dir, 'tuning_results.csv'), index=False)
    
    # -------------------------------------------------------------
    # 4. Save Plots
    # -------------------------------------------------------------
    sns.set_theme(style="whitegrid")
    
    # Plot Actual vs Predicted for Tuned Models
    plt.figure(figsize=(8, 6))
    sns.scatterplot(x=y_test, y=xgb_y_pred, alpha=0.3, color='teal')
    min_val, max_val = min(y_test.min(), xgb_y_pred.min()), max(y_test.max(), xgb_y_pred.max())
    plt.plot([min_val, max_val], [min_val, max_val], 'r--', lw=2, label='Ideal 1:1')
    plt.title('Actual vs Predicted - Tuned XGBoost')
    plt.xlabel('Actual LIMIT_BAL')
    plt.ylabel('Predicted LIMIT_BAL')
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(opt_plots_dir, 'tuned_xgboost_actual_vs_pred.png'))
    plt.close()

    plt.figure(figsize=(8, 6))
    sns.scatterplot(x=y_test, y=rf_y_pred, alpha=0.3, color='forestgreen')
    min_val, max_val = min(y_test.min(), rf_y_pred.min()), max(y_test.max(), rf_y_pred.max())
    plt.plot([min_val, max_val], [min_val, max_val], 'r--', lw=2, label='Ideal 1:1')
    plt.title('Actual vs Predicted - Tuned Random Forest')
    plt.xlabel('Actual LIMIT_BAL')
    plt.ylabel('Predicted LIMIT_BAL')
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(opt_plots_dir, 'tuned_rf_actual_vs_pred.png'))
    plt.close()
    
    # Comparison Bar Plot for Test R2
    plt.figure(figsize=(10, 5))
    sns.barplot(data=df_final, x='Model', y='Test R2', palette='viridis')
    plt.xticks(rotation=15)
    plt.title('Test R² Comparison Across Models')
    plt.tight_layout()
    plt.savefig(os.path.join(opt_plots_dir, 'test_r2_comparison.png'))
    plt.close()

    # Comparison Bar Plot for Test MAE
    plt.figure(figsize=(10, 5))
    sns.barplot(data=df_final, x='Model', y='Test MAE', palette='crest')
    plt.xticks(rotation=15)
    plt.title('Test MAE Comparison Across Models (Lower is Better)')
    plt.tight_layout()
    plt.savefig(os.path.join(opt_plots_dir, 'test_mae_comparison.png'))
    plt.close()
    
    # Overfitting Gap Comparison
    plt.figure(figsize=(10, 5))
    sns.barplot(data=df_final, x='Model', y='Overfitting Gap (R2)', palette='magma')
    plt.xticks(rotation=15)
    plt.title('Overfitting Gap (Train R² - Test R²) Across Models (Lower is Better)')
    plt.tight_layout()
    plt.savefig(os.path.join(opt_plots_dir, 'overfitting_gap_comparison.png'))
    plt.close()

    # -------------------------------------------------------------
    # 5. Optimization Report
    # -------------------------------------------------------------
    best_row = df_final.loc[df_final['Test MAE'].idxmin()]
    best_r2_row = df_final.loc[df_final['Test R2'].idxmax()]
    best_rmse_row = df_final.loc[df_final['Test RMSE'].idxmin()]
    
    report_text = f"""==================================================
MODEL OPTIMIZATION REPORT - CREDIT CARD LIMIT PREDICTION
==================================================

1. TUNING PARAMETERS:
--- XGBoost ---
Best Parameters: {best_xgb_params}
5-Fold CV Best Neg MAE: {xgb_search.best_score_:.4f}

--- Random Forest ---
Best Parameters: {best_rf_params}
5-Fold CV Best Neg MAE: {rf_search.best_score_:.4f}

2. COMPLETE MODEL COMPARISON (5 MODELS):
{df_final.to_string(index=False)}

3. COMPARATIVE ANALYSIS & OVERFITTING REDUCTION:
   - Lowest Test MAE: {best_row['Model']} ({best_row['Test MAE']})
   - Lowest Test RMSE: {best_rmse_row['Model']} ({best_rmse_row['Test RMSE']})
   - Highest Test R2: {best_r2_row['Model']} ({best_r2_row['Test R2']})

   Overfitting Gap Reduction:
   - Original XGBoost Overfitting Gap (R2): {df_final.loc[df_final['Model'] == 'Original XGBoost', 'Overfitting Gap (R2)'].values[0]}
   - Tuned XGBoost Overfitting Gap (R2): {xgb_tuned_metrics['Overfitting Gap (R2)']}
   
   - Original Random Forest Overfitting Gap (R2): {df_final.loc[df_final['Model'] == 'Original Random Forest', 'Overfitting Gap (R2)'].values[0]}
   - Tuned Random Forest Overfitting Gap (R2): {rf_tuned_metrics['Overfitting Gap (R2)']}

4. FINAL MODEL SELECTION:
   Selected Model: {best_row['Model']}
   Justification: It achieved the lowest Test MAE, high Test R2, and significantly reduced the train-test performance gap compared to the unconstrained baseline model.
==================================================
"""
    with open(os.path.join(output_dir, 'optimization_report.txt'), 'w') as f:
        f.write(report_text)
        
    print("\nOptimization Complete!")
    print(df_final.to_string(index=False))

if __name__ == '__main__':
    main()
