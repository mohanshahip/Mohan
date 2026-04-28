import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, LabelList
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import '../../../styles/Charts.css';

const CustomLegend = React.memo(({ processedData, t }) => (
  <div className="visits-legend">
    <div className="legend-item">
      <div className="legend-line success"></div>
      <span>{t('dashboard.positive-growth')}</span>
    </div>
    <div className="legend-item">
      <div className="legend-line error"></div>
      <span>{t('dashboard.negative-growth')}</span>
    </div>
    <div className="legend-item">
      <div className="legend-line primary"></div>
      <span>{t('dashboard.stable')}</span>
    </div>
  </div>
));

const ContentPerformanceChart = ({ data, onDataPointClick, timeRange = 'week' }) => {
  const { t } = useTranslation();
  const [hoveredBar, setHoveredBar] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Process data with enhancements
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      ...item,
      growth: item.growth || 0,
      target: item.target || 1000,
      performance: Math.min(100, (item.views / item.target) * 100)
    }));
  }, [data]);

  const handleBarClick = (data) => {
    if (onDataPointClick) {
      onDataPointClick(data);
    }
    setSelectedCategory(data.name);
  };

  const getBarColor = (index, growth) => {
    if (hoveredBar === index) return 'var(--primary-color)';
    if (selectedCategory === processedData[index]?.name) return 'var(--primary-dark)';
    
    if (growth > 0) return 'var(--success)';
    if (growth < 0) return 'var(--error)';
    
    return 'var(--primary-color)';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip visits-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-label">{label}</span>
            {data.growth !== undefined && (
              <span className={`tooltip-growth ${data.growth >= 0 ? 'positive' : 'negative'}`}>
                {data.growth >= 0 ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
                {Math.abs(data.growth)}%
              </span>
            )}
          </div>
          <div className="tooltip-content">
            <div className="tooltip-metric">
              <span className="metric-label">{t('dashboard.views')}:</span>
              <span className="metric-value">{data.views.toLocaleString()}</span>
            </div>
            <div className="tooltip-metric">
              <span className="metric-label">{t('dashboard.target')}:</span>
              <span className="metric-value">{data.target.toLocaleString()}</span>
            </div>
            <div className="tooltip-metric">
              <span className="metric-label">{t('dashboard.performance')}:</span>
              <span className="metric-value">{data.performance.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!processedData.length) {
    return (
      <div className="chart-container empty">
        <div className="empty-state">
          <TrendingUp size={48} strokeWidth={1} />
          <h4>{t('dashboard.no-performance-data')}</h4>
          <p>{t('dashboard.no-content-performance-data')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container performance-chart">
      <div className="chart-header">
        <div className="chart-title-section">
          <h3>{t('dashboard.content-performance')}</h3>
          <p className="chart-subtitle">{t('dashboard.contentPerformanceSubtitle') || 'Analyzing engagement across categories'}</p>
        </div>
        <div className="chart-actions">
          <button className="chart-action-btn" onClick={() => setSelectedCategory(null)}>
            {t('common.reset') || 'Reset'}
          </button>
        </div>
      </div>
      
      <div className="chart-content">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            onClick={handleBarClick}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
            />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={CustomTooltip} wrapperStyle={{ t }} />
            <Legend content={CustomLegend} wrapperStyle={{ processedData, t }} />
            <Bar 
              dataKey="views" 
              name={t('dashboard.views')}
              radius={[6, 6, 0, 0]}
              onMouseEnter={(_, index) => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {processedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(index, entry.growth)}
                  opacity={selectedCategory && selectedCategory !== entry.name ? 0.3 : 0.8}
                  className="bar-cell"
                />
              ))}
              <LabelList 
                dataKey="views" 
                position="top" 
                formatter={(value) => value.toLocaleString()}
                fill="var(--text-primary)"
                fontSize={11}
                fontWeight={700}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-footer">
        <div className="chart-summary">
          <div className="summary-item">
            <span className="summary-label">{t('dashboard.total-views')}</span>
            <span className="summary-value">
              {processedData.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">{t('dashboard.avg-performance')}</span>
            <span className="summary-value">
              {(processedData.reduce((sum, item) => sum + item.performance, 0) / processedData.length).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ContentPerformanceChart);
