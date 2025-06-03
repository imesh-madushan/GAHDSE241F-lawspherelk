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
  { type: 'Homicide', points: 100 },
  { type: 'Manslaughter', points: 95 },
  { type: 'Rape', points: 92 },
  { type: 'Human Trafficking', points: 90 },
  { type: 'Armed Robbery', points: 88 },
  { type: 'Sexual Assault', points: 85 },
  { type: 'Kidnapping', points: 83 },
  { type: 'Child Abduction', points: 82 },
  { type: 'Drug Trafficking', points: 80 },
  { type: 'Drug Smuggling', points: 79 },
  { type: 'Illegal Drug Manufacturing', points: 78 },
  { type: 'Extortion', points: 76 },
  { type: 'Bribery', points: 75 },
  { type: 'Blackmail', points: 73 },
  { type: 'Insider Trading', points: 72 },
  { type: 'Embezzlement', points: 70 },
  { type: 'Money Laundering', points: 68 },
  { type: 'Forgery', points: 65 },
  { type: 'Tax Evasion', points: 63 },
  { type: 'Identity Theft', points: 60 },
  { type: 'Cyber Fraud', points: 58 },
  { type: 'Phishing', points: 56 },
  { type: 'Hacking', points: 55 },
  { type: 'Data Breach', points: 54 },
  { type: 'Burglary', points: 52 },
  { type: 'Theft', points: 50 },
  { type: 'Vehicle Theft', points: 48 },
  { type: 'Motorcycle Theft', points: 47 },
  { type: 'Shoplifting', points: 45 },
  { type: 'Arson', points: 44 },
  { type: 'Vandalism', points: 42 },
  { type: 'Illegal Possession of Firearms', points: 41 },
  { type: 'Corruption', points: 40 },
  { type: 'Disorderly Conduct', points: 38 },
  { type: 'Domestic Violence', points: 36 },
  { type: 'Indecent Exposure', points: 34 },
  { type: 'Online Harassment', points: 32 },
  { type: 'Cyberbullying', points: 31 },
  { type: 'Possession of Child Pornography', points: 30 },
  { type: 'Threatening Behavior', points: 29 },
  { type: 'Trespassing', points: 28 },
  { type: 'Smuggling', points: 26 },
  { type: 'Loitering', points: 24 },
  { type: 'Illegal Protests', points: 20 },
  { type: 'Public Intoxication', points: 18 },
  { type: 'Riot Participation', points: 17 },
  { type: 'Assault', points: 15 }
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
    { value: 'Alleged', label: 'Alleged', styles: 'text-blue-500 bg-blue-100 border-blue-200' },
    { value: 'Convicted', label: 'Convicted', styles: 'text-green-500 bg-green-100 border-green-200' },
    { value: 'Acquitted', label: 'Acquitted', styles: 'text-gray-500 bg-gray-100 border-gray-200' },
];

export const investigationStatusList = [
    { value: 'inprogress', label: 'In Progress', styles: 'text-blue-500 bg-blue-100 border-blue-200' },
    { value: 'completed', label: 'Completed', styles: 'text-green-500 bg-green-100 border-green-200' },
    { value: 'closed', label: 'Closed', styles: 'text-gray-500 bg-gray-100 border-gray-200' },
];

export const investigationTypes = [
    'Evidence Collection',
    'Witness Interview',
    'Crime Scene Analysis',
    'Forensic Investigation',
    'Background Check',
    'Surveillance',
    'Digital Investigation',
    'Financial Investigation',
    'Document Analysis',
    'Scene Reconstruction'
];