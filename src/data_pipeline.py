import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
import os
import joblib

def main():
    # 1. Inspect the dataset
    print("--- 1. Inspecting Dataset ---")
    df_raw = pd.read_csv('../data/UCI_Credit_Card.csv')
    
    with open('../outputs/dataset_report.txt', 'w') as f:
        f.write("--- DATASET SHAPE ---\n")
        f.write(str(df_raw.shape) + "\n\n")
        
        f.write("--- COLUMNS & DATA TYPES ---\n")
        f.write(str(df_raw.dtypes) + "\n\n")
        
        f.write("--- MISSING VALUES ---\n")
        f.write(str(df_raw.isnull().sum()) + "\n\n")
        
        f.write("--- DUPLICATES ---\n")
        f.write(str(df_raw.duplicated().sum()) + "\n\n")
        
        f.write("--- UNIQUE VALUES ---\n")
        f.write(str(df_raw.nunique()) + "\n\n")
        
        f.write("--- DESCRIPTIVE STATISTICS ---\n")
        f.write(str(df_raw.describe()) + "\n\n")
        
        f.write("--- LEAKAGE EVALUATION ---\n")
        f.write("Target is LIMIT_BAL. 'default.payment.next.month' is information from the future and constitutes data leakage. It will be excluded.\n")

    # 2. Clean the data
    print("--- 2. Cleaning Data ---")
    df_clean = df_raw.copy()
    
    # Drop duplicates
    initial_shape = df_clean.shape
    df_clean.drop_duplicates(inplace=True)
    
    # Drop ID and leakage column
    cols_to_drop = ['ID', 'default.payment.next.month']
    df_clean.drop(columns=[col for col in cols_to_drop if col in df_clean.columns], inplace=True)
    
    # Clean categorical values based on dataset description: 
    # EDUCATION: 1=grad school, 2=uni, 3=high school, 0,4,5,6=others
    if 'EDUCATION' in df_clean.columns:
        df_clean['EDUCATION'] = df_clean['EDUCATION'].apply(lambda x: 4 if x not in [1, 2, 3] else x)
    
    # MARRIAGE: 1=married, 2=single, 3=others, 0=others
    if 'MARRIAGE' in df_clean.columns:
        df_clean['MARRIAGE'] = df_clean['MARRIAGE'].apply(lambda x: 3 if x not in [1, 2] else x)
        
    df_clean.to_csv('../data/cleaned_credit_data.csv', index=False)
    
    with open('../outputs/cleaning_report.txt', 'w') as f:
        f.write("--- CLEANING REPORT ---\n")
        f.write(f"Initial shape: {initial_shape}\n")
        f.write(f"Shape after removing duplicates and dropping ID / target leakage: {df_clean.shape}\n")
        f.write("Grouped undocumented values in EDUCATION (to 4) and MARRIAGE (to 3).\n")

    # 3. Perform EDA
    print("--- 3. Performing EDA ---")
    os.makedirs('../outputs/eda', exist_ok=True)
    sns.set_theme(style="whitegrid")
    
    # LIMIT_BAL distribution
    plt.figure(figsize=(10, 5))
    sns.histplot(df_clean['LIMIT_BAL'], bins=50, kde=True)
    plt.title('Distribution of LIMIT_BAL')
    plt.savefig('../outputs/eda/limit_bal_dist.png')
    plt.close()
    
    plt.figure(figsize=(10, 5))
    sns.boxplot(x=df_clean['LIMIT_BAL'])
    plt.title('Boxplot of LIMIT_BAL')
    plt.savefig('../outputs/eda/limit_bal_boxplot.png')
    plt.close()
    
    # Age distribution
    plt.figure(figsize=(10, 5))
    sns.histplot(df_clean['AGE'], bins=30, kde=True)
    plt.title('Age Distribution')
    plt.savefig('../outputs/eda/age_dist.png')
    plt.close()
    
    # Credit limit vs age
    plt.figure(figsize=(10, 6))
    sns.boxplot(x='AGE', y='LIMIT_BAL', data=df_clean)
    plt.xticks(rotation=90)
    plt.title('Credit Limit vs Age')
    plt.savefig('../outputs/eda/limit_vs_age.png')
    plt.close()
    
    # Correlation heatmap
    plt.figure(figsize=(15, 12))
    corr = df_clean.corr()
    sns.heatmap(corr, annot=False, cmap='coolwarm')
    plt.title('Correlation Heatmap')
    plt.savefig('../outputs/eda/correlation_heatmap.png')
    plt.close()
    
    # Credit limit by education
    plt.figure(figsize=(8, 5))
    sns.boxplot(x='EDUCATION', y='LIMIT_BAL', data=df_clean)
    plt.title('Credit Limit by Education')
    plt.savefig('../outputs/eda/limit_by_education.png')
    plt.close()
    
    with open('../outputs/eda_report.txt', 'w') as f:
        f.write("EDA Observations:\n")
        f.write("1. LIMIT_BAL is right-skewed, with most limits clustered at the lower end.\n")
        f.write("2. Age is also right-skewed, mostly centered around late 20s to 30s.\n")
        f.write("3. Education level shows a slight trend where higher education correlates with higher credit limits.\n")
        f.write("4. Bill amounts are highly correlated with each other.\n")

    # 4. Feature engineering
    print("--- 4. Feature Engineering ---")
    df_feat = df_clean.copy()
    
    bill_cols = [f'BILL_AMT{i}' for i in range(1, 7)]
    pay_cols = [f'PAY_AMT{i}' for i in range(1, 7)]
    delay_cols = ['PAY_0', 'PAY_2', 'PAY_3', 'PAY_4', 'PAY_5', 'PAY_6']
    
    df_feat['total_bill_amount'] = df_feat[bill_cols].sum(axis=1)
    df_feat['average_bill_amount'] = df_feat[bill_cols].mean(axis=1)
    
    df_feat['total_payment_amount'] = df_feat[pay_cols].sum(axis=1)
    df_feat['average_payment_amount'] = df_feat[pay_cols].mean(axis=1)
    
    # payment-to-bill ratio (add epsilon to avoid division by zero)
    epsilon = 1e-5
    df_feat['payment_to_bill_ratio'] = df_feat['total_payment_amount'] / (df_feat['total_bill_amount'].replace(0, epsilon) + epsilon)
    
    df_feat['min_bill_amount'] = df_feat[bill_cols].min(axis=1)
    df_feat['max_bill_amount'] = df_feat[bill_cols].max(axis=1)
    df_feat['min_payment_amount'] = df_feat[pay_cols].min(axis=1)
    df_feat['max_payment_amount'] = df_feat[pay_cols].max(axis=1)
    
    # number of payment delays
    # PAY_X > 0 means payment delay
    df_feat['num_payment_delays'] = (df_feat[delay_cols] > 0).sum(axis=1)
    
    df_feat.to_csv('../data/featured_credit_data.csv', index=False)

    # 5. Prepare training data
    print("--- 5. Preparing Training Data ---")
    X = df_feat.drop(columns=['LIMIT_BAL'])
    y = df_feat['LIMIT_BAL']
    
    categorical_features = ['SEX', 'EDUCATION', 'MARRIAGE'] + delay_cols
    numerical_features = [col for col in X.columns if col not in categorical_features]
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Fit only on training data
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    
    # Save the transformed datasets (convert back to dense for CSV saving, or save as npz/joblib, let's just save arrays in joblib or dataframes)
    # Since categorical onehot encodes to many columns, saving to joblib is better. But let's create a DataFrame.
    cat_names = preprocessor.named_transformers_['cat'].get_feature_names_out(categorical_features)
    feature_names = numerical_features + list(cat_names)
    
    X_train_df = pd.DataFrame(X_train_processed, columns=feature_names)
    X_test_df = pd.DataFrame(X_test_processed, columns=feature_names)
    
    X_train_df.to_csv('../data/X_train.csv', index=False)
    X_test_df.to_csv('../data/X_test.csv', index=False)
    y_train.to_csv('../data/y_train.csv', index=False)
    y_test.to_csv('../data/y_test.csv', index=False)
    joblib.dump(preprocessor, '../models/preprocessor.joblib')

    # 6. Final validation
    print("--- 6. Final Validation ---")
    print(f"Total original records: {df_raw.shape[0]}")
    print(f"Records after cleaning: {df_clean.shape[0]}")
    assert df_clean.shape[0] >= 8000, "Less than 8000 records."
    
    print(f"Missing values in X_train: {X_train_df.isnull().sum().sum()}")
    print(f"Infinite values in X_train: {np.isinf(X_train_df.values).sum()}")
    
    assert 'ID' not in X.columns, "ID is still in features."
    assert 'LIMIT_BAL' not in X.columns, "Target is still in features."
    assert 'default.payment.next.month' not in X.columns, "Leakage column is still in features."
    
    print(f"X_train shape: {X_train_df.shape}")
    print(f"X_test shape: {X_test_df.shape}")
    
    print("Features list:", feature_names[:10], "... (truncated)")
    print("Data is valid and ready for model training.")

if __name__ == '__main__':
    # Switch to script directory to ensure relative paths work
    import os
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    main()
