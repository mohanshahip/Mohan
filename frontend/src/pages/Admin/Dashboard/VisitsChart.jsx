import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';
import '../../../styles/Charts.css';

const CustomTooltip = React.memo(({ active, payload, label }) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="visits-tooltip">
        <div className="tooltip-header">
          <Calendar size={12} />
          <span className="tooltip-date">{label}</span>
        </div>
        <div className="tooltip-content">
          <div className="tooltip-metric">
            <div className="metric-label">
              <div className="metric-color primary" />
              <span>{t('dashboard.visits')}</span>
            </div>
            <span className="metric-value">{data.visits.toLocaleString()}</span>
          </div>
          <div className="tooltip-metric">
            <div className="metric-label">
              <div className="metric-color success" />
              <span>{t('dashboard.page-views')}</span>
            </div>
            <span className="metric-value">{data.pageViews.toLocaleString()}</span>
          </div>
          {data.bounceRate > 0 && (
            <div className="tooltip-metric">
              <div className="metric-label">
                <span>{t('dashboard.bounce-rate')}</span>
              </div>
              <span className={`metric-value ${data.bounceRate > 50 ? 'warning' : ''}`}>
                {data.bounceRate.toFixed(1)}%
              </span>
            </div>
          )}
          {data.conversion > 0 && (
            <div className="tooltip-metric">
              <div className="metric-label">
                <span>{t('dashboard.conversion')}</span>
              </div>
              <span className="metric-value">{data.conversion.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
});

const CustomLegend = React.memo(({ showPredictions }) => {
  const { t } = useTranslation();
  return (
    <div className="visits-legend">
      <div className="legend-item">
        <div className="legend-line primary" />
        <span>{t('dashboard.visits')}</span>
      </div>
      <div className="legend-item">
        <div className="legend-line success" />
        <span>{t('dashboard.page-views')}</span>
      </div>
      {showPredictions && (
        <div className="legend-item predicted">
          <div className="legend-line predicted" />
          <span>{t('dashboard.predicted-visits')}</span>
        </div>
      )}
    </div>
  );
});

const VisitsChart = ({
  data, 
  timeRange = 'week',
  onTimeRangeChange,
  onExport,
  showPredictions = false,
  showAverage = true
}) => {
  const { t, i18n } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [loading] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);

  // Enhanced time range options
  const timeRangeOptions = [
    { value: 'day', label: t('dashboard.time-range-today'), days: 1 },
    { value: 'week', label: t('dashboard.time-range-week'), days: 7 },
    { value: 'month', label: t('dashboard.time-range-month'), days: 30 },
    { value: 'quarter', label: t('dashboard.time-range-quarter'), days: 90 },
    { value: 'year', label: t('dashboard.time-range-year'), days: 365 }
  ];

  // Process data with enhancements
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item, _index) => ({
      ...item,
      date: item.date || item.time,
      visits: item.visits || 0,
      pageViews: item.pageViews || 0,
      bounceRate: item.bounceRate || 0,
      avgDuration: item.avgDuration || 0,
      conversion: item.conversion || 0,
      predictedVisits: showPredictions ? item.predictedVisits : undefined
    }));
  }, [data, showPredictions]);

  const calculateStats = useMemo(() => {
    if (!processedData.length) return null;
    
    const visits = processedData.map(d => d.visits);
    const pageViews = processedData.map(d => d.pageViews);
    
    return {
      totalVisits: visits.reduce((a, b) => a + b, 0),
      totalPageViews: pageViews.reduce((a, b) => a + b, 0),
      avgVisits: Math.round(visits.reduce((a, b) => a + b, 0) / visits.length),
      avgPageViews: Math.round(pageViews.reduce((a, b) => a + b, 0) / pageViews.length),
      maxVisits: Math.max(...visits),
      minVisits: Math.min(...visits),
      growthRate: ((visits[visits.length - 1] - visits[0]) / visits[0] * 100).toFixed(1)
    };
  }, [processedData]);

  const formatXAxis = (tickItem) => {
    if (timeRange === 'day') {
      // Format as time (e.g., "14:00")
      return tickItem;
    } else if (timeRange === 'week') {
      // Format as day name (e.g., "Mon")
      return new Date(tickItem).toLocaleDateString(i18n.language === 'np' ? 'ne-NP' : 'en-US', { weekday: 'short' });
    } else {
      // Format as date (e.g., "Jan 15")
      return new Date(tickItem).toLocaleDateString(i18n.language === 'np' ? 'ne-NP' : 'en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleAreaClick = (data) => {
    setSelectedPeriod(data.date);
    // Could trigger a modal or detailed view here
  };

  if (loading) {
    return (
      <div className="chart-container visits-chart loading">
        <div className="chart-skeleton">
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
          <div className="skeleton-line medium"></div>
        </div>
      </div>
    );
  }

  if (!processedData.length) {
    return (
      <div className="chart-container visits-chart empty">
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <h4>{t('dashboard.no-traffic-data')}</h4>
          <p>{t('dashboard.no-data-for-period')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container visits-chart">
      <div className="chart-header">
        <div className="chart-title-section">
          <h3>{t('dashboard.traffic-analytics')}</h3>
          <div className="time-range-selector">
            {timeRangeOptions.map(option => (
              <button
                key={option.value}
                className={`time-range-btn ${timeRange === option.value ? 'active' : ''}`}
                onClick={() => onTimeRangeChange && onTimeRangeChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="chart-actions">
          <button 
            className="chart-action-btn"
            onClick={() => setShowAnnotations(!showAnnotations)}
          >
            {showAnnotations ? t('dashboard.hide-annotations') : t('dashboard.show-annotations')}
          </button>
          <button 
            className="chart-action-btn export"
            onClick={onExport}
            title={t('common.export')}
          >
            <Download size={14} />
            <span>{t('common.export')}</span>
          </button>
        </div>
      </div>

      {calculateStats && (
        <div className="chart-stats-overview">
          <div className="stat-card">
            <div className="stat-label">{t('dashboard.total-visits')}</div>
            <div className="stat-value">{calculateStats.totalVisits.toLocaleString()}</div>
            <div className="stat-change">
              {parseFloat(calculateStats.growthRate) >= 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span className={parseFloat(calculateStats.growthRate) >= 0 ? 'positive' : 'negative'}>
                {Math.abs(parseFloat(calculateStats.growthRate))}%
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{t('dashboard.page-views')}</div>
            <div className="stat-value">{calculateStats.totalPageViews.toLocaleString()}</div>
            <div className="stat-change">
              <span>{t('dashboard.avg')}: {calculateStats.avgPageViews}/day</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{t('dashboard.avg-visits-per-day')}</div>
            <div className="stat-value">{calculateStats.avgVisits.toLocaleString()}</div>
            <div className="stat-change">
              <span>{t('dashboard.peak')}: {calculateStats.maxVisits.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="chart-content">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={processedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onClick={handleAreaClick}
            onMouseMove={(e) => {
              if (e.activePayload) {
                // setHoveredData(e.activePayload[0].payload); // Removed as hoveredData is unused
              }
            }}
            onMouseLeave={() => {}} // Removed setHoveredData(null) as hoveredData is unused
          >
            <defs>
              <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="pageViewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(0,0,0,0.05)"
              vertical={false}
            />
            <XAxis 
              dataKey="date"
              tickFormatter={formatXAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickFormatter={(value) => value.toLocaleString()}
              domain={[0, 'auto']}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
            />
            
            {/* Reference lines for better insights */}
            {showAverage && calculateStats && (
              <ReferenceLine 
                y={calculateStats.avgVisits} 
                stroke="#6b7280" 
                strokeDasharray="3 3"
                strokeOpacity={0.5}
                label={{
                  value: t('dashboard.average'),
                  position: 'right',
                  fill: '#6b7280',
                  fontSize: 10
                }}
              />
            )}
            
            {/* Highlight selected period */}
            {selectedPeriod && (
              <ReferenceArea
                x1={selectedPeriod}
                x2={selectedPeriod}
                fill="rgba(102, 126, 234, 0.1)"
              />
            )}

            <Area
              type="monotone"
              dataKey="visits"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#visitsGradient)"
              name={t('dashboard.visits')}
              activeDot={{
                r: 6,
                fill: '#3b82f6',
                stroke: '#ffffff',
                strokeWidth: 2
              }}
            />
            <Area
              type="monotone"
              dataKey="pageViews"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#pageViewsGradient)"
              name={t('dashboard.page-views')}
              activeDot={{
                r: 6,
                fill: '#10b981',
                stroke: '#ffffff',
                strokeWidth: 2
              }}
            />
            
            {/* Predicted data (dashed line) */}
            {showPredictions && (
              <Area
                type="monotone"
                dataKey="predictedVisits"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="none"
                name={t('dashboard.predicted-visits')}
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-footer">
        <CustomLegend showPredictions={showPredictions} />
      </div>
    </div>
  );
};

export default React.memo(VisitsChart);
