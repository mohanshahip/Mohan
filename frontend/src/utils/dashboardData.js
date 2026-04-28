export const generateAnalyticsData = (poemCount, projectCount, galleryCount, skillCount, range) => {
  const baseVisits = (poemCount + projectCount + galleryCount + skillCount) * 100;
  
  let visitsData = [];
  switch (range) {
    case 'day':
      visitsData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        visits: Math.floor(baseVisits * (0.3 + Math.random() * 0.7) / 24),
        pageViews: Math.floor(baseVisits * (0.8 + Math.random() * 1.2) / 24)
      }));
      break;
    case 'week':
      const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      visitsData = weekDays.map(day => ({
        date: day,
        visits: Math.floor(baseVisits * (0.4 + Math.random() * 0.6) / 7),
        pageViews: Math.floor(baseVisits * (0.9 + Math.random() * 1.1) / 7)
      }));
      break;
    default:
      visitsData = [
        { date: 'Mon', visits: Math.floor(baseVisits * 0.15), pageViews: Math.floor(baseVisits * 0.35) },
        { date: 'Tue', visits: Math.floor(baseVisits * 0.18), pageViews: Math.floor(baseVisits * 0.4) },
        { date: 'Wed', visits: Math.floor(baseVisits * 0.16), pageViews: Math.floor(baseVisits * 0.38) },
        { date: 'Thu', visits: Math.floor(baseVisits * 0.2), pageViews: Math.floor(baseVisits * 0.45) },
        { date: 'Fri', visits: Math.floor(baseVisits * 0.18), pageViews: Math.floor(baseVisits * 0.42) },
        { date: 'Sat', visits: Math.floor(baseVisits * 0.12), pageViews: Math.floor(baseVisits * 0.28) },
        { date: 'Sun', visits: Math.floor(baseVisits * 0.1), pageViews: Math.floor(baseVisits * 0.25) }
      ];
  }

  return {
    visits: visitsData,
    contentViews: [
      { name: 'Projects', views: projectCount * 850 },
      { name: 'Poems', views: poemCount * 650 },
      { name: 'Skills', views: skillCount * 450 },
      { name: 'Gallery', views: galleryCount * 350 },
      { name: 'Home', views: (poemCount + projectCount + galleryCount + skillCount) * 1200 }
    ],
    trafficSources: [
      { name: 'Direct', value: 35, color: '#0088FE' },
      { name: 'Social', value: 25, color: '#00C49F' },
      { name: 'Search', value: 20, color: '#FFBB28' },
      { name: 'Referral', value: 15, color: '#FF8042' },
      { name: 'Email', value: 5, color: '#8884D8' }
    ],
    devices: [
      { name: 'Desktop', value: 55, color: '#0088FE' },
      { name: 'Mobile', value: 40, color: '#00C49F' },
      { name: 'Tablet', value: 5, color: '#FFBB28' }
    ]
  };
};

export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const exportData = (data, type) => {
  const exportData = {
    ...data,
    exportedAt: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `dashboard-${type}-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};