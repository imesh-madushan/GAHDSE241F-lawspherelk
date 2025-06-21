import { test, expect, chromium } from '@playwright/test';

// Increase test timeout to 30 minutes for manual interaction
test.setTimeout(1800000);

// List of case types (excluding "Rape" and "Sexual Abuse")
const caseTypes = [
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
  'Human Trafficking',
  'Public Disturbance',
  'Fraud or Financial Crime',
  'Cyber Crime',
  'Robbery',
  'Bribery or Corruption',
  'Terrorism or Extremism',
  'Traffic Accident',
  'Illegal Construction or Land Grabbing',
  'Suicide or Sudden Death Investigation',
  'Political Protest'
];

// 15 real-world complaint scenarios
const complaints = [
  {
    description: 'Dispute between neighbors over land boundary.',
    evidence_details: 'Complainant describes the land boundary issue and previous altercations.',
    complainer: { nic: '900000001V', name: 'Sunil Perera', phone: '0771001001', email: 'sunilp@gmail.com', address: '12 Lake Road, Galle', dob: '1980-05-12' }
  },
  {
    description: 'Motorcycle stolen from parking lot.',
    evidence_details: 'Complainant provides details of the theft and possible suspects.',
    complainer: { nic: '900000002V', name: 'Kamal Silva', phone: '0771001002', email: 'kamals@gmail.com', address: '45 Main Street, Colombo', dob: '1992-08-21' }
  },
  {
    description: 'Public disturbance due to loud music at night.',
    evidence_details: 'Complainant reports repeated noise disturbances from a neighbor.',
    complainer: { nic: '900000003V', name: 'Rashmi Fernando', phone: '0771001003', email: 'rashmif@gmail.com', address: '88 Beach Road, Negombo', dob: '1985-11-30' }
  },
  {
    description: 'Suspected fraudulent withdrawal from bank account.',
    evidence_details: 'Complainant noticed unauthorized transaction in bank statement.',
    complainer: { nic: '900000004V', name: 'Nimal Jayasinghe', phone: '0771001004', email: 'nimalj@gmail.com', address: '23 Temple Road, Kandy', dob: '1975-03-18' }
  },
  {
    description: 'Missing person: teenager not returned home.',
    evidence_details: 'Complainant provides last seen details and possible contacts.',
    complainer: { nic: '900000005V', name: 'Dilani Abeykoon', phone: '0771001005', email: 'dilania@gmail.com', address: '7 Flower Road, Matara', dob: '1978-09-10' }
  },
  {
    description: 'Physical assault at workplace reported.',
    evidence_details: 'Complainant describes the incident and injuries sustained.',
    complainer: { nic: '900000006V', name: 'Kasun Fernando', phone: '0771001006', email: 'kasunf@gmail.com', address: '19 Ocean View, Trincomalee', dob: '1989-12-01' }
  },
  {
    description: 'Forgery of official land documents.',
    evidence_details: 'Complainant presents forged documents and suspects.',
    complainer: { nic: '900000007V', name: 'Nirosha Ekanayake', phone: '0771001007', email: 'niroshae@gmail.com', address: '34 Kandy Road, Kurunegala', dob: '1983-07-22' }
  },
  {
    description: 'Threatening phone calls received repeatedly.',
    evidence_details: 'Complainant records details of threatening calls.',
    complainer: { nic: '900000008V', name: 'Saman Wijesinghe', phone: '0771001008', email: 'samanw@gmail.com', address: '56 Main Street, Badulla', dob: '1987-04-15' }
  },
  {
    description: 'Bribery attempt reported by government official.',
    evidence_details: 'Complainant describes the bribery attempt and provides evidence.',
    complainer: { nic: '900000009V', name: 'Harshani Wickramasinghe', phone: '0771001009', email: 'harshaniw@gmail.com', address: '90 Temple Lane, Polonnaruwa', dob: '1990-10-05' }
  },
  {
    description: 'Illegal construction on public land.',
    evidence_details: 'Complainant provides photos and location details.',
    complainer: { nic: '900000010V', name: 'Ajith Kumara', phone: '0771001010', email: 'ajithk@gmail.com', address: '101 Lake Road, Anuradhapura', dob: '1972-02-28' }
  },
  {
    description: 'Child abuse suspected in neighborhood.',
    evidence_details: 'Complainant reports suspicious behavior and possible abuse.',
    complainer: { nic: '900000011V', name: 'Sanduni Perera', phone: '0771001011', email: 'sandunip@gmail.com', address: '22 Palm Avenue, Jaffna', dob: '1995-06-17' }
  },
  {
    description: 'Drug offense: suspicious activity near school.',
    evidence_details: 'Complainant observed drug exchange and provides details.',
    complainer: { nic: '900000012V', name: 'Ruwan Fernando', phone: '0771001012', email: 'ruwanf@gmail.com', address: '77 Harbor Road, Hambantota', dob: '1982-01-09' }
  },
  {
    description: 'Robbery at local grocery store.',
    evidence_details: 'Complainant describes the robbery and missing items.',
    complainer: { nic: '900000013V', name: 'Nadeesha Herath', phone: '0771001013', email: 'nadeeshah@gmail.com', address: '12 Market Street, Monaragala', dob: '1984-12-25' }
  },
  {
    description: 'Traffic accident involving three vehicles.',
    evidence_details: 'Complainant provides accident details and witness info.',
    complainer: { nic: '900000014V', name: 'Suresh Bandara', phone: '0771001014', email: 'sureshb@gmail.com', address: '33 River Road, Gampaha', dob: '1979-08-03' }
  },
  {
    description: 'Political protest blocking main road.',
    evidence_details: 'Complainant reports protest and traffic disruption.',
    complainer: { nic: '900000015V', name: 'Lakmal Jayalath', phone: '0771001015', email: 'lakmalj@gmail.com', address: '5 Hill Street, Kegalle', dob: '1986-11-11' }
  }
];

// Helper to get a random case type (excluding sexual/rape)
function getRandomCaseType() {
  const idx = Math.floor(Math.random() * caseTypes.length);
  return caseTypes[idx];
}

// Users with their complaint counts
const users = [
  { username: 'maheshperera', count: 1 },
  { username: 'ranjithsilva', count: 2 },
  { username: 'suniljayasinghe', count: 1 },
  { username: 'nadeeshaherath', count: 2 },
  { username: 'harshaniwickramasinghe', count: 1 },
  { username: 'ajithkumara', count: 2 },
  { username: 'isharasenanayake', count: 2 },
  { username: 'sureshbandara', count: 1 },
  { username: 'rameshgunasekara', count: 2 },
  { username: 'kasunfernando', count: 1 },
  { username: 'kavindarathnayake', count: 2 },
  { username: 'sitharamadushani', count: 2 }
];

// Generate complaints array based on user counts
function generateComplaints() {
  const allComplaints: any[] = [];
  let complaintIndex = 0;
  
  users.forEach(user => {
    for (let i = 0; i < user.count; i++) {
      if (complaintIndex < complaints.length) {
        allComplaints.push({
          ...complaints[complaintIndex],
          username: user.username
        });
        complaintIndex++;
      }
    }
  });
  
  return allComplaints;
}

test('bulk create complaints with different users', async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const complaintsToCreate = generateComplaints();
  
  for (let i = 0; i < complaintsToCreate.length; i++) {
    const c = complaintsToCreate[i];
    const complaintType = getRandomCaseType();

    console.log(`\n=== Creating Complaint ${i + 1}/${complaintsToCreate.length} ===`);
    console.log(`User: ${c.username}`);
    console.log(`Type: ${complaintType}`);
    console.log(`Description: ${c.description}`);

    // Login with current user
    await page.goto('http://localhost:5173/login');
    await page.waitForTimeout(1000);
    
    await page.fill('input[name="username"]', c.username);
    await page.fill('input[name="password"]', 'abcd1234');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Go to complaints page
    await page.goto('http://localhost:5173/complaints');
    await page.waitForTimeout(1000);
    
    // Open modal
    await page.click('button:has-text("Create New Complaint")');
    await page.waitForTimeout(500);

    // Fill complainer details
    await page.fill('input[name="nic"]', c.complainer.nic);
    await page.waitForTimeout(100);
    await page.fill('input[name="name"]', c.complainer.name);
    await page.waitForTimeout(100);
    await page.fill('input[name="phone"]', c.complainer.phone);
    await page.waitForTimeout(100);
    await page.fill('input[name="email"]', c.complainer.email);
    await page.waitForTimeout(100);
    await page.fill('textarea[name="address"]', c.complainer.address);
    await page.waitForTimeout(100);
    await page.fill('input[name="dob"]', c.complainer.dob);
    await page.waitForTimeout(100);

    // Select complaint type
    await page.selectOption('select[name="complaintType"]', { label: complaintType });
    await page.waitForTimeout(100);

    // Fill complaint details
    await page.fill('textarea[name="description"]', c.description);
    await page.waitForTimeout(100);
    await page.fill('textarea[name="evidence_details"]', c.evidence_details);
    await page.waitForTimeout(200);

    // Wait for you to click "Submit Complaint" manually
    console.log(`Waiting for you to click "Submit Complaint" for complaint ${i + 1}/${complaintsToCreate.length}`);
    await page.waitForSelector('text=Complaint Created Successfully', { timeout: 120000 }); // 2 minutes timeout

    // Click OK on popup to close modal
    await page.click('button:has-text("OK")');

    // Wait a moment before next
    await page.waitForTimeout(500);
  }

  await browser.close();
});