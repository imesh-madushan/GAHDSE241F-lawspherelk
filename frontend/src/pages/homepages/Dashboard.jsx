// src/pages/OICDashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import CustomDropdown from '../../components/dropdowns/CustomDropdown';
import { caseTypes } from '../../../data';
import {
  Folder,
  Description,
  Search,
  People,
  Add,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart as PieChartIcon,
  DonutLarge,
  Timeline,
  FilterList,
  Assignment,
  Settings,
  Schedule,
  Science,
  LocationOn
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../config/apiConfig';
import { Link } from 'react-router-dom';

// Import Recharts components
import {
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const Dashboard = () => {
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [statsValues, setStatsValues] = useState([]); //to store the stats count
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Add error state variables
  const [complaintsError, setComplaintsError] = useState(null);
  const [casesError, setCasesError] = useState(null);
  const [officersError, setOfficersError] = useState(null);
  const [statsError, setStatsError] = useState(null);
  // Monthly complaints chart states
  const [complaintsChartData, setComplaintsChartData] = useState([]);
  const [complaintTimePeriod, setComplaintTimePeriod] = useState('monthly');
  const [complaintTypeFilter, setComplaintTypeFilter] = useState('all');

  const { user } = useAuth();
  const [actions, setActions] = useState([]);
  const [calculatedStats, setCalculatedStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  // Chart states
  const [caseTypeFilter, setCaseTypeFilter] = useState('all');
  const [caseAnalyticsData, setCaseAnalyticsData] = useState([]);
  const [caseStatusData, setCaseStatusData] = useState([]);  // NEW: Additional chart states

  // Function to prepare chart data - wrapped in useCallback
  const prepareCaseTypeChartData = useCallback((cases, filter = 'all') => {
    // Group cases by case_type
    const casesByType = {};

    cases.forEach(caseItem => {
      if (!caseItem.case_type) return;

      // Skip if filtered and not matching the filter
      if (filter !== 'all' && caseItem.case_type !== filter) return;

      if (!casesByType[caseItem.case_type]) {
        casesByType[caseItem.case_type] = 0;
      }
      casesByType[caseItem.case_type]++;
    });

    // Convert to the format needed by Recharts
    return Object.entries(casesByType).map(([type, count]) => ({
      name: type,
      value: count,
      color: ''  // Assign a color based on case type
    })).sort((a, b) => b.value - a.value);  // Sort by count descending
  }, []);

  const prepareStatusChartData = useCallback((cases) => {
    const statusCounts = {
      'inprogress': 0,
      'closed': 0
    };

    cases.forEach(caseItem => {
      if (Object.prototype.hasOwnProperty.call(statusCounts, caseItem.case_status)) {
        statusCounts[caseItem.case_status]++;
      }
    });

    return [
      { name: 'In Progress', value: statusCounts.inprogress, color: '#3B82F6' },
      { name: 'Closed', value: statusCounts.closed, color: '#10B981' }
    ];
  }, []);

  // Get a color based on case type for consistent colors in charts
  const getChartColor = (type) => {
    const colorMap = {
      'Criminal': '#EF4444',
      'Civil Dispute': '#3B82F6',
      'Child Abuse': '#F59E0B',
      'Missing Person': '#8B5CF6',
      'Domestic Violence': '#EC4899',
      'Drug Offense': '#10B981',
      'Motorcycle Theft': '#6366F1',
      'Land Dispute': '#0EA5E9',
      'Assault and Battery': '#D946EF',
      'Murder/Homicide': '#DC2626'
    };

    // Return the mapped color or a default color
    return colorMap[type] || '#6B7280';
  };
  // Function to prepare complaint chart data by time period (daily, weekly, monthly, yearly)
  const prepareComplaintChartData = useCallback((complaints, filter = 'all', timePeriod = 'monthly') => {
    if (!complaints || complaints.length === 0) return [];

    // Extract complaint dates and filter by type if needed
    const filteredComplaints = filter === 'all'
      ? complaints
      : complaints.filter(complaint => complaint.case_type === filter);

    // Time period formatting for grouping
    const timeFormatMap = {
      'daily': {
        format: (date) => date.toISOString().split('T')[0], // YYYY-MM-DD
        label: (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      },
      'weekly': {
        format: (date) => {
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          return startOfWeek.toISOString().split('T')[0];
        },
        label: (date) => {
          const startOfWeek = new Date(date);
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }
      },
      'monthly': {
        format: (date) => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`,
        label: (date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      },
      'yearly': {
        format: (date) => date.getFullYear().toString(),
        label: (date) => date.getFullYear().toString()
      }
    };

    // Group complaints by the selected time period
    const complaintCounts = {};
    const timeFormatter = timeFormatMap[timePeriod];

    // Sort complaints by date first to ensure proper ordering
    filteredComplaints.sort((a, b) => new Date(a.complain_dt) - new Date(b.complain_dt));

    // Count complaints by time period
    filteredComplaints.forEach(complaint => {
      if (!complaint.complain_dt) return;

      const complaintDate = new Date(complaint.complain_dt);
      const timePeriodKey = timeFormatter.format(complaintDate);

      if (!complaintCounts[timePeriodKey]) {
        complaintCounts[timePeriodKey] = {
          period: timePeriodKey,
          count: 0,
          label: timeFormatter.label(complaintDate)
        };
      }

      complaintCounts[timePeriodKey].count++;
    });

    // Convert to array and sort by time period
    let chartData = Object.values(complaintCounts).sort((a, b) => a.period.localeCompare(b.period));

    // Calculate trend (increase/decrease percentage)
    if (chartData.length >= 2) {
      for (let i = 1; i < chartData.length; i++) {
        const currentCount = chartData[i].count;
        const previousCount = chartData[i - 1].count;

        if (previousCount > 0) {
          const changePercent = ((currentCount - previousCount) / previousCount) * 100;
          chartData[i].change = changePercent;
        } else if (currentCount > 0) {
          chartData[i].change = 100; // If previous was 0, consider it 100% increase
        } else {
          chartData[i].change = 0;
        }
      }
    }

    return chartData;
  }, []);

  // Get available complaint types from complaints data
  const extractComplaintTypes = useCallback((complaints) => {
    if (!complaints || complaints.length === 0) return [];

    const typesSet = new Set();
    complaints.forEach(complaint => {
      if (complaint.case_type) {
        typesSet.add(complaint.case_type);
      }
    });

    return Array.from(typesSet);
  }, []);

  // Handle filter change for case types chart
  const handleCaseTypeFilterChange = (e) => {
    setCaseTypeFilter(e.target.value);
    // Update chart data based on new filter
    if (recentCases.length > 0) {
      setCaseAnalyticsData(prepareCaseTypeChartData(recentCases, e.target.value));
    }
  };  // Handle filter change for complaint types chart
  const handleComplaintTypeFilterChange = (e) => {
    setComplaintTypeFilter(e.target.value);
  };

  // Handle time period change for complaints chart
  const handleTimePeriodChange = (e) => {
    setComplaintTimePeriod(e.target.value);
  };

  // Function to calculate role-based stats from real data
  const calculateRoleBasedStats = useCallback((role, cases, complaints, officers) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Filter current month data
    const thisMonthCases = cases.filter(c => new Date(c.created_at) >= thisMonth);
    const lastMonthCases = cases.filter(c =>
      new Date(c.created_at) >= lastMonth && new Date(c.created_at) < thisMonth
    );
    const thisMonthComplaints = complaints.filter(c => new Date(c.complain_dt) >= thisMonth);
    const lastMonthComplaints = complaints.filter(c =>
      new Date(c.complain_dt) >= lastMonth && new Date(c.complain_dt) < thisMonth
    );

    // Calculate changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? `+${current}` : "0";
      const change = current - previous;
      return change >= 0 ? `+${change}` : `${change}`;
    };

    const getTrend = (current, previous) => {
      if (current > previous) return 'up';
      if (current < previous) return 'down';
      return 'stable';
    };

    switch (role) {
      case 'OIC': {
        const activeCases = cases.filter(c => c.case_status === 'inprogress').length;
        // Pending Reviews: count of complaints with complaint_status === 'new'
        const pendingReviews = complaints.filter(c => c.complaint_status === 'new').length;
        const activeOfficers = officers.filter(o => o.status === 'active' || !o.status).length;
        const monthlySolved = cases.filter(c => c.case_status === 'closed' && new Date(c.updated_at) >= thisMonth).length;

        const lastMonthActiveCases = cases.filter(c => c.case_status === 'inprogress' && new Date(c.created_at) < thisMonth).length;
        const lastMonthSolved = cases.filter(c => c.case_status === 'closed' &&
          new Date(c.updated_at) >= lastMonth && new Date(c.updated_at) < thisMonth).length;

        return [
          {
            title: "Active Cases",
            value: activeCases,
            change: calculateChange(activeCases, lastMonthActiveCases),
            trend: getTrend(activeCases, lastMonthActiveCases),
            color: "blue",
          },
          {
            title: "Complaints to Review",
            value: pendingReviews,
            change: calculateChange(pendingReviews, 0),
            trend: pendingReviews > 0 ? 'up' : 'stable',
            color: "yellow",
          },
          {
            title: "Active Officers",
            value: activeOfficers,
            change: "0",
            trend: "stable",
            color: "green",
          },
          {
            title: "Monthly Solved Cases",
            value: monthlySolved,
            change: calculateChange(monthlySolved, lastMonthSolved),
            trend: getTrend(monthlySolved, lastMonthSolved),
            color: "purple",
          },
        ];
      }
      case 'Crime OIC': {
        const activeInvestigations = cases.filter(c =>
          c.case_status === 'inprogress' &&
          ['Criminal', 'Murder/Homicide', 'Assault and Battery'].includes(c.case_type)
        ).length;
        // Pending Reviews: count of complaints with complaint_status === 'new'
        const pendingReviews = complaints.filter(c => c.complaint_status === 'new').length;
        const evidenceItems = cases.reduce((total, c) => total + (c.evidence_count || 0), 0);
        const investigationTeams = Math.ceil(activeInvestigations / 2); // Estimate 2 cases per team
        const forensicReports = cases.filter(c =>
          c.case_status === 'closed' && new Date(c.updated_at) >= thisMonth
        ).length;

        return [
          {
            title: "Active Investigations",
            value: activeInvestigations,
            change: calculateChange(activeInvestigations, 0),
            trend: activeInvestigations > 0 ? 'up' : 'stable',
            color: "red",
          },
          {
            title: "Pending Reviews",
            value: pendingReviews,
            change: calculateChange(pendingReviews, 0),
            trend: pendingReviews > 0 ? 'up' : 'stable',
            color: "yellow",
          },
          {
            title: "Evidence Items",
            value: evidenceItems,
            change: `+${Math.floor(evidenceItems * 0.1)}`,
            trend: "up",
            color: "blue",
          },
          {
            title: "Investigation Teams",
            value: investigationTeams,
            change: "0",
            trend: "stable",
            color: "green",
          },
          {
            title: "Forensic Reports",
            value: forensicReports,
            change: calculateChange(forensicReports, 0),
            trend: forensicReports > 0 ? 'up' : 'stable',
            color: "purple",
          },
        ].slice(0, 4); // Only show 4 cards
      }
      case 'Inspector': {
        const inspectorCases = cases.filter(c => c.assigned_officer_id === user?.id).length;
        const teamOfficers = officers.filter(o =>
          ['Sub Inspector', 'Sergeant', 'Police Constable'].includes(o.role)
        ).length;
        const evidenceCollected = cases.filter(c =>
          c.assigned_officer_id === user?.id && c.evidence_count > 0
        ).reduce((total, c) => total + c.evidence_count, 0);
        const reportsFiled = thisMonthCases.filter(c => c.assigned_officer_id === user?.id).length;

        return [
          {
            title: "Assigned Cases",
            value: inspectorCases,
            change: calculateChange(inspectorCases, 0),
            trend: inspectorCases > 0 ? 'up' : 'stable',
            color: "blue",
          },
          {
            title: "Team Officers",
            value: teamOfficers,
            change: "0",
            trend: "stable",
            color: "green",
          },
          {
            title: "Evidence Collected",
            value: evidenceCollected,
            change: `+${Math.floor(evidenceCollected * 0.2)}`,
            trend: "up",
            color: "purple",
          },
          {
            title: "Reports Filed",
            value: reportsFiled,
            change: calculateChange(reportsFiled, 0),
            trend: reportsFiled > 0 ? 'up' : 'stable',
            color: "orange",
          },
        ];
      }
      case 'Sub Inspector': {
        const myCases = cases.filter(c => c.assigned_officer_id === user?.id).length;
        const myEvidence = cases.filter(c => c.assigned_officer_id === user?.id)
          .reduce((total, c) => total + (c.evidence_count || 0), 0);
        const witnesses = cases.filter(c => c.assigned_officer_id === user?.id)
          .reduce((total, c) => total + (c.witness_count || 0), 0);
        const pendingTasks = cases.filter(c =>
          c.assigned_officer_id === user?.id && c.case_status === 'inprogress'
        ).length;

        return [
          {
            title: "My Cases",
            value: myCases,
            change: calculateChange(myCases, 0),
            trend: myCases > 0 ? 'up' : 'stable',
            color: "blue",
          },
          {
            title: "Evidence Items",
            value: myEvidence,
            change: `+${Math.floor(myEvidence * 0.15)}`,
            trend: "up",
            color: "green",
          },
          {
            title: "Witnesses",
            value: witnesses,
            change: `+${Math.floor(witnesses * 0.2)}`,
            trend: "up",
            color: "purple",
          },
          {
            title: "Pending Tasks",
            value: pendingTasks,
            change: calculateChange(pendingTasks, 0),
            trend: pendingTasks > 0 ? 'up' : 'stable',
            color: "orange",
          },
        ];
      }
      default: {
        const totalReports = thisMonthComplaints.length;
        const patrolHours = 156; // This would come from patrol logs in real system
        const incidentsHandled = thisMonthComplaints.length;
        const evidenceCollectedPC = cases.reduce((total, c) => total + (c.evidence_count || 0), 0);

        return [
          {
            title: "My Reports",
            value: totalReports,
            change: calculateChange(totalReports, lastMonthComplaints.length),
            trend: getTrend(totalReports, lastMonthComplaints.length),
            color: "blue",
          },
          {
            title: "Patrol Hours",
            value: patrolHours,
            change: "+8",
            trend: "up",
            color: "green",
          },
          {
            title: "Incidents Handled",
            value: incidentsHandled,
            change: calculateChange(incidentsHandled, lastMonthComplaints.length),
            trend: getTrend(incidentsHandled, lastMonthComplaints.length),
            color: "purple",
          },
          {
            title: "Evidence Collected",
            value: evidenceCollectedPC,
            change: `+${Math.floor(evidenceCollectedPC * 0.1)}`,
            trend: "up",
            color: "orange",
          },
        ];
      }
    }
  }, [user]);

  // Generate role-based recent activities from real data
  const generateRecentActivities = useCallback((role, cases, complaints, officers) => {
    const now = new Date();
    const recentCases = cases.filter(c => {
      const createdDate = new Date(c.created_at);
      const timeDiff = now - createdDate;
      return timeDiff <= 24 * 60 * 60 * 1000; // Last 24 hours
    }).slice(0, 5);

    const recentComplaints = complaints.filter(c => {
      const createdDate = new Date(c.complain_dt);
      const timeDiff = now - createdDate;
      return timeDiff <= 24 * 60 * 60 * 1000; // Last 24 hours
    }).slice(0, 3);

    const activities = [];

    switch (role) {
      case 'OIC':
        // Add pending review activities
        {
          const pendingCases = cases.filter(c => c.case_status === 'oicnotreviewed');
          pendingCases.slice(0, 2).forEach(c => {
            activities.push({
              type: "case_review",
              title: `Case ${c.case_id} requires review`,
              time: "Pending",
              priority: "high",
            });
          });

          // Add recent case activities
          recentCases.forEach(c => {
            activities.push({
              type: "case_created",
              title: `New case ${c.case_id} created`,
              time: formatTimeAgo(c.created_at),
              priority: "medium",
            });
          });
          break;
        }

      case 'Crime OIC':
        // Add crime-related activities
        {
          const crimeInvestigations = cases.filter(c =>
            ['Criminal', 'Murder/Homicide', 'Assault and Battery'].includes(c.case_type)
          );
          crimeInvestigations.slice(0, 3).forEach(c => {
            activities.push({
              type: "investigation_update",
              title: `Investigation for ${c.case_type} case updated`,
              time: formatTimeAgo(c.updated_at || c.created_at),
              priority: c.case_status === 'inprogress' ? "high" : "medium",
            });
          });
          break;
        }

      case 'Inspector':
        // Add assigned case activities
        {
          const assignedCases = cases.filter(c => c.assigned_officer_id === user?.id);
          assignedCases.slice(0, 3).forEach(c => {
            activities.push({
              type: "case_assigned",
              title: `Case ${c.case_id} requires attention`,
              time: formatTimeAgo(c.updated_at || c.created_at),
              priority: c.case_status === 'inprogress' ? "high" : "medium",
            });
          });
          break;
        }

      case 'Sub Inspector':
        // Add evidence and case activities
        {
          const myCases = cases.filter(c => c.assigned_officer_id === user?.id);
          myCases.slice(0, 3).forEach(c => {
            activities.push({
              type: "case_progress",
              title: `Case ${c.case_id} status updated`,
              time: formatTimeAgo(c.updated_at || c.created_at),
              priority: c.case_status === 'inprogress' ? "medium" : "low",
            });
          });
          break;
        }

      default:
        // Default activities for other roles
        recentComplaints.forEach(c => {
          activities.push({
            type: "complaint_filed",
            title: `New complaint filed: ${c.case_type}`,
            time: formatTimeAgo(c.complain_dt),
            priority: "medium",
          });
        });
        break;
    }

    return activities.slice(0, 5); // Return max 5 activities
  }, [user]);

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Less than 1 hour ago";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Set actions directly based on user role
  useEffect(() => {
    if (user && user.role) {
      const roleActions = {
        'OIC': [
          { title: 'Review Cases', icon: 'Assignment', link: '/cases' },
          { title: 'Manage Officers', icon: 'People', link: '/officers' }
        ],
        'Crime OIC': [
          { title: 'Manage Investigations', icon: 'Search', link: '/investigations' },
          { title: 'Review Evidence', icon: 'Description', link: '/evidences' }
        ],
        'Sub Inspector': [
          { title: 'My Cases', icon: 'Assignment', link: '/cases' },
          { title: 'Add Evidence', icon: 'Add', link: '/evidences/create' }
        ],
        'Inspector': [
          { title: 'Team Management', icon: 'People', link: '/team' },
          { title: 'Case Reports', icon: 'Description', link: '/reports' }
        ],
        'Police Constable': [
          { title: 'My Duties', icon: 'Assignment', link: '/my-duties' },
          { title: 'Report Incident', icon: 'Report', link: '/report-incident' }
        ]
      };

      setActions(roleActions[user.role] || roleActions['Police Constable'] || []);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    // Fetch complaints
    try {
      const { data } = await apiClient.get('/complaints/getAllComplaints');
      if (data.complaints) {
        setRecentComplaints(data.complaints);
      }
    }
    catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaintsError('Failed to load complaints.');
    } finally {
      setIsLoadingComplaints(false);
    }

    // Fetch cases
    try {
      const { data } = await apiClient.get('/cases/getAllCases');
      if (data.cases) {
        const cases = data.cases;
        setRecentCases(cases);
      }
    }
    catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(error.response.data.message);
      } else {
        console.error('Error fetching cases:', error);
        setCasesError('Failed to load cases.');
      }
    } finally {
      setIsLoadingCases(false);
    }

    // Fetch officers
    try {
      const res = await apiClient.post('/officers/getAll');
      if (res.data.officers) {
        setOfficers(res.data.officers);
      }
    } catch (error) {
      console.error('Error fetching officers:', error);
      setOfficersError('Failed to load officers.');
    } finally {
      setIsLoadingOfficers(false);
    }
  }, []);

  // Effect for initial data fetching - only runs once
  useEffect(() => {
    fetchData();
  }, [fetchData]);  // Calculate stats and activities when data is loaded
  useEffect(() => {
    if (!isLoadingCases && !isLoadingComplaints && !isLoadingOfficers && user?.role) {
      // Calculate role-based stats
      const stats = calculateRoleBasedStats(user.role, recentCases, recentComplaints, officers);
      setCalculatedStats(stats);

      // Generate recent activities
      const activities = generateRecentActivities(user.role, recentCases, recentComplaints, officers);
      setRecentActivities(activities);      // Prepare chart data
      if (recentCases.length > 0) {
        setCaseAnalyticsData(prepareCaseTypeChartData(recentCases, caseTypeFilter));
        setCaseStatusData(prepareStatusChartData(recentCases));
      }

      // Set loading stats to false when all calculations are done
      setIsLoadingStats(false);
    } else if (!isLoadingCases && !isLoadingComplaints && !isLoadingOfficers && !user?.role) {
      // If data is loaded but no user role, still stop loading
      setIsLoadingStats(false);
    }
  }, [
    isLoadingCases,
    isLoadingComplaints,
    isLoadingOfficers,
    user,
    recentCases,
    recentComplaints,
    officers,
    calculateRoleBasedStats,
    generateRecentActivities,
    prepareCaseTypeChartData,
    prepareStatusChartData,
    caseTypeFilter
  ]);

  // Stats processing is now handled by the dashboardData structure
  // Role-specific stats are now dynamically loaded from the dashboard data
  // Icons are now directly used in the components

  const getStatColor = (color) => {
    const colors = {
      blue: 'bg-gradient-to-r from-black to-blue-700 ',
      green: 'bg-gradient-to-r from-black to-green-700 ',
      purple: 'bg-gradient-to-r from-black to-purple-700 ',
      orange: 'bg-gradient-to-r from-black to-orange-700 ',
      red: 'bg-gradient-to-r from-black to-red-700 ',
      yellow: 'bg-gradient-to-r from-black to-yellow-700 '
    };
    return colors[color] || colors.blue;
  };

  // Process complaints data when it loads or filters change
  useEffect(() => {
    // Skip on initial render when we don't have data yet
    if (recentComplaints.length > 0) {
      // Update complaints chart data based on filter changes
      setComplaintsChartData(prepareComplaintChartData(recentComplaints, complaintTypeFilter, complaintTimePeriod));
    }
  }, [recentComplaints, complaintTimePeriod, complaintTypeFilter, prepareComplaintChartData]);
  // Process case data when it loads or filter changes
  useEffect(() => {
    if (recentCases.length > 0) {
      // Update all chart data that depends on cases
      setCaseAnalyticsData(prepareCaseTypeChartData(recentCases, caseTypeFilter));
      setCaseStatusData(prepareStatusChartData(recentCases));
    }
  }, [recentCases, caseTypeFilter, prepareCaseTypeChartData, prepareStatusChartData]);

  if (!user || isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role} Dashboard
        </h1>
        <p className="text-gray-600 mt-0.5">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoadingStats ? (
          // Loading state for stats cards
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
              <div className="p-2 border-b border-gray-200">
                <div className="bg-gray-300 h-1 w-full rounded-full animate-pulse"></div>
              </div>
              <div className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          calculatedStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow overflow-hidden border border-gray-200 transform hover:scale-105 transition-transform duration-200">
              <div className="p-2 border-b border-gray-200">
                <div className={`${getStatColor(stat.color)} h-1 w-full rounded-full`}></div>
              </div>
              <div className="p-6 text-center">
                <p className="text-gray-500 text-sm font-medium mb-3">{stat.title}</p>
                <p className="text-4xl font-bold text-black mb-2">{stat.value}</p>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Charts Section */}
      <div className="space-y-6 mb-8">
        {/* Row 1: Complaints Trend and Case Status */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Complaints Trend - Takes 2/3 width */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-xl font-semibold text-black">Complaints Trend</h3>
                <p className="text-sm text-gray-500 mt-1">Track complaint patterns over time</p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <CustomDropdown
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly' }
                  ]}
                  value={complaintTimePeriod}
                  onChange={handleTimePeriodChange}
                  name="timePeriod"
                  className="w-32"
                  icon={Timeline}
                  theme="black"
                />
                <CustomDropdown
                  options={[
                    { value: 'all', label: 'All Types' },
                    ...caseTypes.map(type => ({ value: type, label: type }))
                  ]}
                  value={complaintTypeFilter}
                  onChange={handleComplaintTypeFilterChange}
                  name="complaintType"
                  className="w-40"
                  icon={FilterList}
                  theme="black"
                />
              </div>
            </div>

            <div className="h-64 bg-gray-50 rounded-lg p-4">
              {isLoadingComplaints ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading complaints trend...</p>
                  </div>
                </div>
              ) : complaintsChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={complaintsChartData} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip
                      formatter={(value) => [`${value} complaints`, 'Total Complaints']}
                      labelFormatter={(label) => `Period: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '2px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Complaints"
                      stroke="black"
                      strokeWidth={2}
                      dot={{ fill: 'black', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: 'black', strokeWidth: 2, fill: 'white' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Timeline className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-black font-medium">No complaint data available</p>
                    <p className="text-gray-400 text-sm mt-1">Add new complaints to see trends</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/*  Case Distribution */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-xl font-semibold text-black">Case Distribution</h3>
                <p className="text-sm text-gray-500 mt-1">Overview of case types in the system</p>
              </div>
              <CustomDropdown
                options={[
                  { value: 'all', label: 'All Case Types' },
                  ...caseTypes.map(type => ({ value: type, label: type }))
                ]}
                value={caseTypeFilter}
                onChange={handleCaseTypeFilterChange}
                name="caseType"
                className="w-48"
                icon={FilterList}
                theme="black"
              />
            </div>

            <div className="h-64 overflow-x-auto bg-gray-50 rounded-lg p-4">
              {isLoadingCases ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading case analytics...</p>
                  </div>
                </div>
              ) : caseAnalyticsData && caseAnalyticsData.length > 0 ? (
                <ResponsiveContainer width={Math.max(500, caseAnalyticsData.length * 50)} height="100%">
                  <RechartsBarChart
                    data={caseAnalyticsData}
                    margin={{ left: 10, right: 15, top: 15, bottom: 15 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      interval={0}
                      angle={-10}
                      textAnchor="end"
                      height={20}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip
                      formatter={(value) => [`${value} cases`, 'Total Cases']}
                      labelFormatter={(label) => `Case Type: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {caseAnalyticsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-black font-medium">No case data available</p>
                    <p className="text-gray-400 text-sm mt-1">Cases will appear here once created</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-black">Recent Activities</h3>
            <p className="text-sm text-gray-500 mt-1">Latest updates and actions in the system</p>
          </div>
          <Link
            to="/activities"
            className="text-black hover:text-gray-600 text-sm font-medium flex items-center space-x-1 transition-colors"
          >
            <span>View All</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="space-y-1">
          {recentActivities.length > 0 ? (
            recentActivities.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${activity.priority === 'high' ? 'bg-red-500' :
                  activity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-black font-medium text-sm truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${activity.priority === 'high' ? 'bg-red-100 text-red-800' :
                  activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                  {activity.priority}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Assignment className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-black font-medium">No recent activities</p>
              <p className="text-gray-400 text-sm mt-1">Activities will appear here as they occur</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;