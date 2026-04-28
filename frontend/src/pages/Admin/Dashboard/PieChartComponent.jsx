import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector,
  Legend
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import '../../../styles/Charts.css';

const CustomTooltip = React.memo(({ active, payload, t }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip visits-tooltip">
        <div className="tooltip-header">
          <div 
            className="metric-color" 
            style={{ '--metric-color': data.color }}
          />
          <span className="tooltip-label">{data.name}</span>
        </div>
        <div className="tooltip-content">
          <div className="tooltip-metric">
            <span className="metric-label">{t('dashboard.value')}:</span>
            <span className="metric-value">{data.value.toLocaleString()}</span>
          </div>
          <div className="tooltip-metric">
            <span className="metric-label">{t('dashboard.percentage')}:</span>
            <span className="metric-value">{data.percentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
});

const CustomLegend = React.memo(({ processedData, hoveredIndex, selectedSegment, onPieClick, setHoveredIndex, t }) => (
  <div className="visits-legend pie-legend">
    {processedData.map((entry, index) => (
      <div 
        key={`legend-${index}`}
        className={`legend-item ${hoveredIndex === index ? 'hovered' : ''} ${selectedSegment === entry.name ? 'selected' : ''} ${selectedSegment && selectedSegment !== entry.name ? 'not-selected' : ''}`}
        style={{ 
          '--legend-color': entry.color
        }}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        onClick={() => onPieClick(entry, index)}
      >
        <div className="legend-line" />
        <span className="legend-name">{entry.name}</span>
        <span className="legend-value">
          {entry.percentage.toFixed(0)}%
        </span>
      </div>
    ))}
  </div>
));

const PieChartComponent = ({ 
  data, 
  title = 'Distribution', 
  subtitle = 'Data distribution overview',
  onSegmentClick,
  innerRadius = '65%',
  outerRadius = '85%',
  compact = false
}) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);

  // Process data with defaults
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [
        { name: t('dashboard.no-data'), value: 1, color: 'var(--gray-200)' }
      ];
    }

    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];

    const total = data.reduce((sum, i) => sum + i.value, 0);

    return data.map((item, index) => ({
      ...item,
      color: item.color || colors[index % colors.length],
      percentage: total > 0 ? (item.value / total) * 100 : 0
    }));
  }, [data, t]);

  const total = useMemo(() => 
    processedData.reduce((sum, item) => sum + item.value, 0), 
    [processedData]
  );

  const onPieEnter = useCallback((_, index) => {
    setHoveredIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const onPieClick = useCallback((data, index) => {
    setActiveIndex(activeIndex === index ? null : index);
    setSelectedSegment(data.name);
    if (onSegmentClick) {
      onSegmentClick(data);
    }
  }, [activeIndex, onSegmentClick]);

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={Number(outerRadius) + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke={fill}
          strokeWidth={2}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={Number(innerRadius) - 4}
          outerRadius={Number(innerRadius) - 2}
          fill={fill}
        />
      </g>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="chart-container empty">
        <div className="empty-state">
          <PieIcon size={48} strokeWidth={1} />
          <h4>{t('dashboard.noDistributionData') || 'No Distribution Data'}</h4>
          <p>{t('dashboard.no-data-available')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`chart-container pie-chart ${compact ? 'compact' : ''}`}>
      <div className="chart-header">
        <div className="chart-title-section">
          <h3>{title}</h3>
          <p className="chart-subtitle">{subtitle}</p>
        </div>
        <div className="chart-actions">
          <div className="stat-badge">
            {t('dashboard.total')}: {total.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="pie-content">
        <ResponsiveContainer width="100%" height={compact ? 250 : 300}>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={processedData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              onClick={onPieClick}
              animationBegin={0}
              animationDuration={1000}
              stroke="none"
            >
              {processedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={
                    hoveredIndex === index ? 1 :
                    activeIndex === index ? 1 :
                    selectedSegment && selectedSegment !== entry.name ? 0.3 : 0.85
                  }
                  className="pie-cell"
                />
              ))}
            </Pie>
            <Tooltip content={CustomTooltip} wrapperStyle={{ t }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-legend-wrapper">
           <CustomLegend 
             processedData={processedData}
             hoveredIndex={hoveredIndex}
             selectedSegment={selectedSegment}
             onPieClick={onPieClick}
             setHoveredIndex={setHoveredIndex}
             t={t}
           />
        </div>
      </div>
    </div>
  );
};

export default React.memo(PieChartComponent);
