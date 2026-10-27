import React, { useMemo } from 'react';
import { Lightbulb, Info } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { formatCurrency } from '../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.shap_value > 0;
    
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-800 mb-1">{data.clean_feature}</p>
        <p className="text-sm text-slate-600 mb-2">Feature Value: <span className="font-medium">{
          typeof data.feature_value === 'number' && data.feature_value > 1000 
            ? formatCurrency(data.feature_value) 
            : data.feature_value
        }</span></p>
        <div className={`text-sm font-medium flex items-center ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          <span className="mr-1">Impact on Limit:</span>
          <span>{isPositive ? '+' : ''}{formatCurrency(data.shap_value)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function ExplainabilityDashboard({ explanationData }) {
  const chartData = useMemo(() => {
    if (!explanationData?.features) return [];
    
    // Sort by absolute shap value to get the top drivers
    const sorted = [...explanationData.features].sort(
      (a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value)
    );
    
    // Take top 10
    const top10 = sorted.slice(0, 10);
    
    return top10.map(item => {
      // Clean up feature names for better readability
      let cleanName = item.feature
        .replace('num__', '')
        .replace('cat__', '')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
        
      if (cleanName === 'Age') cleanName = 'Age';
      if (cleanName === 'Education 1') cleanName = 'Education: Graduate';
      if (cleanName === 'Education 2') cleanName = 'Education: University';
      if (cleanName === 'Marriage 1') cleanName = 'Marriage: Married';
        
      return {
        ...item,
        clean_feature: cleanName
      };
    }).reverse(); // Reverse so largest is at top of horizontal chart
  }, [explanationData]);

  if (!explanationData || chartData.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Explainable AI (SHAP Analysis)</h2>
        </div>
      </div>
      
      <div className="mb-4 bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start space-x-3 text-sm text-slate-600">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <p>
          <strong>Model Interpretation:</strong> The chart below displays the top 10 features driving the AI's credit limit recommendation. 
          Green bars indicate features that increased the recommended limit, while red bars indicate features that decreased it. 
          <br /><br />
          <em className="text-xs text-slate-500 block mt-1">Note: SHAP values represent model behavior and should not be interpreted as causal relationships.</em>
        </p>
      </div>

      <div className="h-96 w-full overflow-x-auto" aria-label="SHAP feature importance chart">
        <ResponsiveContainer width="100%" height="100%" minWidth={360}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f1f5f9" />
            <XAxis 
              type="number" 
              tickFormatter={(value) => formatCurrency(value, 0)}
              stroke="#94a3b8"
              fontSize={12}
            />
            <YAxis 
              type="category" 
              dataKey="clean_feature" 
              width={160}
              tick={{ fill: '#475569', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#cbd5e1" />
            <Bar dataKey="shap_value" radius={[0, 4, 4, 0]}>
              {
                chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.shap_value > 0 ? '#10b981' : '#f43f5e'} />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
