export const caseTypes = [
    'Criminal',
    'Civil Dispute',
    'Child Abuse',
    'Missing Person',
    'Domestic Violence',
    'Drug Offense',
    'Motorcycle Theft',
    'Land Dispute',
    'Assault and Battery',
    'Murder/Homicide',
    'Illegal Firearms Possession',
    'Sexual Abuse',
    'Human Trafficking',
    'Public Disturbance',
    'Fraud or Financial Crime',
    'Cyber Crime',
    'Robbery',
    'Rape',
    'Bribery or Corruption',
    'Terrorism or Extremism',
    'Traffic Accident',
    'Illegal Construction or Land Grabbing',
    'Suicide or Sudden Death Investigation',
    'Political Protest'
];

export const crimeTypes = [
    { type: 'Homicide', points: 95 },
    { type: 'Manslaughter', points: 85 },
    { type: 'Rape', points: 90 },
    { type: 'Sexual Assault', points: 80 },
    { type: 'Kidnapping', points: 85 },
    { type: 'Child Abduction', points: 85 },
    { type: 'Human Trafficking', points: 90 },
    { type: 'Terrorism', points: 95 },
    { type: 'Armed Robbery', points: 75 },
    { type: 'Aggravated Assault', points: 70 },
    { type: 'Domestic Violence', points: 65 },
    { type: 'Assault', points: 60 },
    { type: 'Possession of Child Pornography', points: 75 },
    { type: 'Drug Trafficking', points: 70 },
    { type: 'Illegal Drug Manufacturing', points: 65 },
    { type: 'Drug Smuggling', points: 65 },
    { type: 'Illegal Possession of Firearms', points: 60 },
    { type: 'Arson', points: 65 },
    { type: 'Extortion', points: 60 },
    { type: 'Blackmail', points: 55 },
    { type: 'Burglary', points: 50 },
    { type: 'Vehicle Theft', points: 45 },
    { type: 'Motorcycle Theft', points: 40 },
    { type: 'Theft', points: 35 },
    { type: 'Shoplifting', points: 30 },
    { type: 'Vandalism', points: 30 },
    { type: 'Cyberbullying', points: 40 },
    { type: 'Online Harassment', points: 45 },
    { type: 'Hacking', points: 50 },
    { type: 'Identity Theft', points: 55 },
    { type: 'Cyber Fraud', points: 55 },
    { type: 'Phishing', points: 50 },
    { type: 'Data Breach', points: 60 },
    { type: 'Embezzlement', points: 55 },
    { type: 'Money Laundering', points: 60 },
    { type: 'Bribery', points: 55 },
    { type: 'Corruption', points: 60 },
    { type: 'Insider Trading', points: 50 },
    { type: 'Tax Evasion', points: 45 },
    { type: 'Forgery', points: 40 },
    { type: 'Threatening Behavior', points: 40 },
    { type: 'Drug Possession', points: 35 },
    { type: 'Trespassing', points: 25 },
    { type: 'Indecent Exposure', points: 35 },
    { type: 'Disorderly Conduct', points: 20 },
    { type: 'Public Intoxication', points: 15 },
    { type: 'Loitering', points: 10 },
    { type: 'Illegal Protests', points: 25 },
    { type: 'Riot Participation', points: 40 },
    { type: 'Smuggling', points: 45 }
];

export const caseStatusList = [
   { value: 'inprogress', label: 'In Progress', styles: 'text-blue-500 bg-blue-100 border-blue-200' },
   { value: 'closed', label: 'Closed', styles: 'text-red-500 bg-red-100 border-red-200' },
];

export const compCaseStatusList = [
   { value: 'oicnotreviewed', label: 'OIC Not Reviewed', styles: 'text-blue-500 bg-blue-100 border-blue-200' },
   { value: 'oicrejected', label: 'OIC Rejected', styles: 'text-red-500 bg-red-100 border-red-200' },
];

export const complainStatusList = [
   { value: 'viewed', label: 'Viewed', styles: 'bg-yellow-100 text-gray-800 border-gray-200' },
   { value: 'new', label: 'New', styles: 'bg-red-100 text-red-600 border-red-200' },
   { value: 'closed', label: 'Closed', styles: 'bg-gray-100 text-gray-600 border-gray-200' },
];

export const offenceStatusList = [
    { value: 'Alleged', label: 'Alleged' },
    { value: 'Convicted', label: 'Convicted' },
    { value: 'Acquitted', label: 'Acquitted' }
];
