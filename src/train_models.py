import pandas as pd
import numpy as np
import time
import os
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def evaluate_model(model, X_train, y_train, X_test, y_test, model_name):
    print(f"--- Training {model_name} ---")
    start_time = time.time()
    model.fit(X_train, y_train)
    training_time = time.time() - start_time
    
    # Predictions
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    # Train Metrics
    train_mae = mean_absolute_error(y_train, y_train_pred)
    train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
    train_r2 = r2_score(y_train, y_train_pred)
    
    # Test Metrics
    test_mae = mean_absolute_error(y_test, y_test_pred)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
    test_r2 = r2_score(y_test, y_test_pred)
    
    # Overfitting Check
    r2_diff = train_r2 - test_r2
    if r2_diff > 0.15:
        overfitting = "High Overfitting"
    elif r2_diff > 0.05:
        overfitting = "Moderate Overfitting"
    else:
        overfitting = "No/Low Overfitting"
        
    metrics = {
        'Model': model_name,
        'Training Time (s)': round(training_time, 4),
        'Train MAE': round(train_mae, 4),
        'Test MAE': round(test_mae, 4),
        'Train RMSE': round(train_rmse, 4),
        'Test RMSE': round(test_rmse, 4),
        'Train R2': round(train_r2, 4),
        'Test R2': round(test_r2, 4),
        'Overfitting Status': overfitting
    }
    
    return metrics, model, y_test_pred

def plot_actual_vs_predicted(y_test, y_pred, model_name, save_path):
    plt.figure(figsize=(8, 6))
    sns.scatterplot(x=y_test, y=y_pred, alpha=0.3, color='indigo')
    max_val = max(y_test.max(), y_pred.max())
    min_val = min(y_test.min(), y_pred.min())
    plt.plot([min_val, max_val], [min_val, max_val], 'r--', lw=2, label='Ideal 1:1')
    plt.xlabel('Actual LIMIT_BAL')
    plt.ylabel('Predicted LIMIT_BAL')
    plt.title(f'Actual vs Predicted - {model_name}')
    plt.legend()
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

def main():
    # Set paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, '..', 'data')
    output_dir = os.path.join(base_dir, '..', 'outputs')
    plots_dir = os.path.join(output_dir, 'model_plots')
    models_dir = os.path.join(base_dir, '..', 'models')
    
    os.makedirs(plots_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)
    
    # Load Data
    X_train = pd.read_csv(os.path.join(data_dir, 'X_train.csv'))
    X_test = pd.read_csv(os.path.join(data_dir, 'X_test.csv'))
    y_train = pd.read_csv(os.path.join(data_dir, 'y_train.csv')).values.ravel()
    y_test = pd.read_csv(os.path.join(data_dir, 'y_test.csv')).values.ravel()
    
    models = {
        'Linear Regression': LinearRegression(),
        'Random Forest': RandomForestRegressor(random_state=42, n_jobs=-1),
        'XGBoost': XGBRegressor(random_state=42, n_jobs=-1)
    }
    
    file_map = {
        'Linear Regression': 'linear_regression.joblib',
        'Random Forest': 'random_forest.joblib',
        'XGBoost': 'xgboost.joblib'
    }
    
    plot_map = {
        'Linear Regression': 'linear_regression_actual_vs_pred.png',
        'Random Forest': 'random_forest_actual_vs_pred.png',
        'XGBoost': 'xgboost_actual_vs_pred.png'
    }
    
    results = []
    
    for name, model in models.items():
        metrics, trained_model, y_test_pred = evaluate_model(model, X_train, y_train, X_test, y_test, name)
        results.append(metrics)
        
        # Save model
        joblib.dump(trained_model, os.path.join(models_dir, file_map[name]))
        
        # Plot actual vs predicted
        plot_actual_vs_predicted(y_test, y_test_pred, name, os.path.join(plots_dir, plot_map[name]))
        
    df_results = pd.DataFrame(results)
    
    # Save CSV
    df_results.to_csv(os.path.join(output_dir, 'model_comparison.csv'), index=False)
    
    # Save TXT comparison
    txt_content = "=== MODEL COMPARISON TABLE ===\n\n" + df_results.to_string(index=False)
    with open(os.path.join(output_dir, 'model_comparison.txt'), 'w') as f:
        f.write(txt_content)
        
    # Detailed Training Report
    best_mae_model = df_results.loc[df_results['Test MAE'].idxmin()]['Model']
    best_rmse_model = df_results.loc[df_results['Test RMSE'].idxmin()]['Model']
    best_r2_model = df_results.loc[df_results['Test R2'].idxmax()]['Model']
    
    report_content = f"""==================================================
ML MODEL TRAINING REPORT - CREDIT CARD LIMIT PREDICTION
==================================================

1. EXPERIMENTAL SETUP:
   - Target Variable: LIMIT_BAL
   - Problem Type: Regression
   - Training Set Size: {X_train.shape[0]} samples
   - Testing Set Size: {X_test.shape[0]} samples
   - Feature Count: {X_train.shape[1]} features (processed)
   - Random State: 42

2. MODEL COMPARISON RESULTS:
{df_results.to_string(index=False)}

3. KEY FINDINGS:
   - Lowest Test MAE: {best_mae_model} ({df_results.loc[df_results['Model'] == best_mae_model, 'Test MAE'].values[0]})
   - Lowest Test RMSE: {best_rmse_model} ({df_results.loc[df_results['Model'] == best_rmse_model, 'Test RMSE'].values[0]})
   - Highest Test R2: {best_r2_model} ({df_results.loc[df_results['Model'] == best_r2_model, 'Test R2'].values[0]})

4. OVERFITTING ANALYSIS:
"""
    for idx, row in df_results.iterrows():
        report_content += f"   - {row['Model']}: Train R2 = {row['Train R2']}, Test R2 = {row['Test R2']} -> Status: {row['Overfitting Status']}\n"

    report_content += f"""
5. SELECTION FOR NEXT STAGE:
   Recommended Model: {best_r2_model}
   Justification: {best_r2_model} achieved the best generalization performance on unseen test data across evaluation metrics.
==================================================
"""
    
    with open(os.path.join(output_dir, 'training_report.txt'), 'w') as f:
        f.write(report_content)
        
    print("\n--- Training Complete ---")
    print(df_results.to_string(index=False))

if __name__ == '__main__':
    main()
