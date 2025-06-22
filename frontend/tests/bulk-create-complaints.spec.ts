import { test, expect, chromium } from '@playwright/test';

// Increase test timeout to 30 minutes for manual interaction
test.setTimeout(1800000);

// 15 real-world complaint scenarios with matching case types
// 15 real-world complaint scenarios with matching case types
const complaints = [
  {
    description: 'Ongoing boundary dispute between neighbors regarding fence placement and property line encroachment causing daily conflicts and tensions.',
    evidence_details: 'The complainant states that their neighbor has illegally moved the boundary fence approximately two meters into their property. They report that this encroachment began three months ago when the neighbor started construction work. The complainant has attempted multiple times to resolve this matter amicably through discussions, but the neighbor has become increasingly hostile and refuses to acknowledge the proper boundary lines despite clear documentation.',
    caseType: 'Land Dispute',
    caseTopic: 'Boundary Dispute Between Adjacent Properties',
    investigations: [
      { topic: 'Land Survey and Boundary Verification', location: '12 Lake Road, Galle and adjacent property' },
      { topic: 'Document Analysis of Property Deeds', location: 'Registrar of Lands Office, Galle' },
      { topic: 'Witness Interviews - Neighboring Residents', location: 'Lake Road Community, Galle' },
      { topic: 'Photographic Evidence Collection of Fence Line', location: 'Disputed boundary area, Lake Road, Galle' }
    ],
    complainer: { nic: '900000001V', name: 'Sunil Perera', phone: '0771001001', email: 'sunilp@gmail.com', address: '12 Lake Road, Galle', dob: '1980-05-12' }
  },
  {
    description: 'Motorcycle theft incident occurred at public parking area during daytime with multiple witnesses present at the scene.',
    evidence_details: 'The complainant reports that their motorcycle, a red Honda CB 150R with registration number WP GAB-1234, was stolen from the public parking area near Galle Fort around 2:00 PM yesterday. They had securely locked the motorcycle and left it for approximately one hour while shopping. Upon returning, they discovered the motorcycle missing. Several shop owners in the vicinity confirmed seeing suspicious individuals near the parking area during that time.',
    caseType: 'Motorcycle Theft',
    caseTopic: 'Motorcycle Theft from Public Parking Area',
    investigations: [
      { topic: 'CCTV Footage Analysis from Galle Fort Area', location: 'Main Street Market, Galle Fort' },
      { topic: 'Witness Statements from Shop Owners', location: 'Pedlar Street vicinity, Galle' },
      { topic: 'Fingerprint Analysis on Lock Mechanism', location: 'Police Forensic Laboratory, Galle' },
      { topic: 'Vehicle Registration and Insurance Verification', location: 'Department of Motor Traffic, Galle' }
    ],
    complainer: { nic: '900000002V', name: 'Kamal Silva', phone: '0771001002', email: 'kamals@gmail.com', address: '45 Pedlar Street, Galle', dob: '1992-08-21' }
  },
  {
    description: 'Repeated public disturbance complaints due to extremely loud music and parties continuing late into the night causing sleep deprivation.',
    evidence_details: 'The complainant describes ongoing harassment from their neighbor who plays loud music and hosts parties that continue until 3:00 AM almost every night for the past two weeks. The noise levels are so excessive that it prevents the complainant and their family, including young children, from sleeping properly. They have approached the neighbor multiple times requesting consideration, but the neighbor becomes aggressive and increases the volume deliberately. The complainant has video recordings of the disturbances.',
    caseType: 'Public Disturbance',
    caseTopic: 'Noise Pollution and Disturbing Peace',
    investigations: [
      { topic: 'Noise Level Measurement During Night Hours', location: '88 Lighthouse Street, Galle' },
      { topic: 'Video Evidence Analysis of Disturbances', location: 'Police Technical Division, Galle' },
      { topic: 'Neighborhood Witness Interviews', location: 'Lighthouse Street residential area, Galle' },
      { topic: 'Sound Equipment Inspection at Source', location: 'Neighbor\'s residence, Lighthouse Street, Galle' }
    ],
    complainer: { nic: '900000003V', name: 'Rashmi Fernando', phone: '0771001003', email: 'rashmif@gmail.com', address: '88 Lighthouse Street, Galle', dob: '1985-11-30' }
  },
  {
    description: 'Suspected fraudulent banking activity involving unauthorized withdrawals and suspicious transactions from personal account without consent.',
    evidence_details: 'The complainant discovered unauthorized transactions totaling Rs. 250,000 withdrawn from their savings account over the past week through ATM withdrawals they did not make. They immediately contacted the bank upon noticing these transactions in their monthly statement. The complainant states they have never shared their PIN or card details with anyone and always keep their debit card secure. Bank surveillance footage shows an unknown individual using the complainant\'s card at multiple ATM locations during times when the complainant was at work.',
    caseType: 'Fraud or Financial Crime',
    caseTopic: 'Unauthorized Bank Account Access and Fraud',
    investigations: [
      { topic: 'ATM Surveillance Footage Review', location: 'Multiple ATM locations across Galle district' },
      { topic: 'Banking Transaction History Analysis', location: 'Commercial Bank, Hospital Road Branch, Galle' },
      { topic: 'Card Skimming Device Detection', location: 'ATM machines used in fraudulent transactions, Galle' },
      { topic: 'Digital Forensics of Banking Systems', location: 'Police Cyber Crime Division, Galle' }
    ],
    complainer: { nic: '900000004V', name: 'Nimal Jayasinghe', phone: '0771001004', email: 'nimalj@gmail.com', address: '23 Hospital Road, Galle', dob: '1975-03-18' }
  },
  {
    description: 'Missing person case involving teenage daughter who failed to return home from school three days ago with no communication since.',
    evidence_details: 'The complainant reports that their 16-year-old daughter left for school on Monday morning as usual but never returned home. She was last seen by classmates leaving the Richmond College premises around 3:30 PM wearing her school uniform. The complainant has contacted all known friends and relatives, but no one has seen or heard from her. Her mobile phone appears to be switched off, and there have been no social media activities. The family is extremely worried as this behavior is completely out of character for their daughter.',
    caseType: 'Missing Person',
    caseTopic: 'Missing Teenager - Last Seen Investigation',
    investigations: [
      { topic: 'School CCTV and Exit Point Analysis', location: 'Richmond College, Galle' },
      { topic: 'Mobile Phone Tower Data Analysis', location: 'Telecommunications providers, Galle' },
      { topic: 'Social Media and Digital Footprint Investigation', location: 'Police Cyber Investigation Unit, Galle' },
      { topic: 'Search Operation in Surrounding Areas', location: 'Rampart Street vicinity and nearby localities, Galle' }
    ],
    complainer: { nic: '900000005V', name: 'Dilani Abeykoon', phone: '0771001005', email: 'dilania@gmail.com', address: '7 Rampart Street, Galle', dob: '1978-09-10' }
  },
  {
    description: 'Physical assault incident at workplace involving supervisor attacking employee during work hours resulting in injuries requiring medical attention.',
    evidence_details: 'The complainant states that during yesterday\'s afternoon shift, their immediate supervisor became extremely angry over a minor work disagreement and physically attacked them in front of several colleagues. The supervisor grabbed the complainant by the shirt, pushed them against the wall, and punched them in the face, causing a black eye and swollen lip. The complainant sought immediate medical attention at the local hospital and has medical reports documenting the injuries. Several coworkers witnessed the entire incident and are willing to provide statements.',
    caseType: 'Assault and Battery',
    caseTopic: 'Workplace Violence and Physical Assault',
    investigations: [
      { topic: 'Medical Evidence Documentation and Analysis', location: 'Karapitiya Teaching Hospital, Galle' },
      { topic: 'Workplace Witness Statement Collection', location: 'Hirdaramani Garment Factory, Baddegama' },
      { topic: 'CCTV Footage Review from Workplace', location: 'Hirdaramani Factory premises, Baddegama' },
      { topic: 'Background Check on Supervisor', location: 'Police Records Division, Galle' }
    ],
    complainer: { nic: '900000006V', name: 'Kasun Fernando', phone: '0771001006', email: 'kasunf@gmail.com', address: '19 Mahinda Road, Baddegama', dob: '1989-12-01' }
  },
  {
    description: 'Document forgery case involving falsified land ownership papers and illegal property title transfers with criminal intent.',
    evidence_details: 'The complainant discovered that someone has created forged documents claiming ownership of their ancestral land property in Hikkaduwa. These fake documents were used to attempt a sale of the property to an unsuspecting buyer. The complainant became aware of this fraud when the legitimate buyer contacted them about inconsistencies in the paperwork. Upon investigation, they found that the forged documents contain false signatures, altered dates, and fake official seals. The complainant suspects their estranged relative who had previously expressed interest in acquiring the property through illegal means.',
    caseType: 'Criminal',
    caseTopic: 'Document Forgery and Land Title Fraud',
    investigations: [
      { topic: 'Forensic Document Analysis and Signature Verification', location: 'Government Analyst Department, Galle' },
      { topic: 'Land Registry Records Investigation', location: 'Registrar General\'s Department, Galle' },
      { topic: 'Suspect Background Investigation and Interviews', location: 'Family residence and known locations, Hikkaduwa' },
      { topic: 'Notary and Legal Document Authentication', location: 'Bar Association offices, Galle' }
    ],
    complainer: { nic: '900000007V', name: 'Nirosha Ekanayake', phone: '0771001007', email: 'niroshae@gmail.com', address: '34 Galle Road, Hikkaduwa', dob: '1983-07-22' }
  },
  {
    description: 'Continuous threatening phone calls and harassment campaign causing fear and anxiety for complainant and family members safety.',
    evidence_details: 'The complainant reports receiving threatening phone calls daily for the past two weeks from an unknown person who uses different phone numbers each time. The caller makes explicit threats against the complainant and their family, including threats of physical violence and property damage. The calls usually occur late at night, disturbing the family\'s peace. The complainant has recorded several of these calls as evidence. The caller appears to know personal details about the complainant\'s daily routine and family members, which increases their fear and concern for safety.',
    caseType: 'Criminal',
    caseTopic: 'Telephone Harassment and Threatening Behavior',
    investigations: [
      { topic: 'Phone Call Recording Analysis and Voice Identification', location: 'Police Technical Division, Galle' },
      { topic: 'Telecommunications Data and Number Tracing', location: 'Service provider offices, Galle' },
      { topic: 'Surveillance of Complainant\'s Daily Routine Areas', location: 'Matara Road vicinity, Galle' },
      { topic: 'Background Check on Potential Suspects', location: 'Police Intelligence Division, Galle' }
    ],
    complainer: { nic: '900000008V', name: 'Saman Wijesinghe', phone: '0771001008', email: 'samanw@gmail.com', address: '56 Matara Road, Galle', dob: '1987-04-15' }
  },
  {
    description: 'Bribery and corruption incident involving government official demanding illegal payments for processing legitimate official documents.',
    evidence_details: 'The complainant states that while attempting to obtain a building permit for their residential construction project in Unawatuna, a government official explicitly demanded Rs. 50,000 as an unofficial payment to expedite the approval process. The official claimed that without this payment, the application would be deliberately delayed for several months. The complainant has documented evidence including audio recordings of the conversation where the bribery demand was made. This corrupt practice is causing significant financial burden and delays for legitimate citizens seeking government services.',
    caseType: 'Bribery or Corruption',
    caseTopic: 'Government Official Bribery and Corruption',
    investigations: [
      { topic: 'Audio Recording Authentication and Analysis', location: 'Police Digital Forensics Lab, Galle' },
      { topic: 'Government Official Background and Asset Investigation', location: 'Galle Municipal Council Office' },
      { topic: 'Surveillance of Official\'s Activities and Contacts', location: 'Government offices and residence, Galle' },
      { topic: 'Similar Complaint Pattern Analysis', location: 'Police Anti-Corruption Unit, Galle' }
    ],
    complainer: { nic: '900000009V', name: 'Harshani Wickramasinghe', phone: '0771001009', email: 'harshaniw@gmail.com', address: '90 Yaddehimulla Road, Unawatuna', dob: '1990-10-05' }
  },
  {
    description: 'Illegal construction activities on public land involving unauthorized building structures without proper permits or legal documentation.',
    evidence_details: 'The complainant observed that unknown individuals have begun constructing a permanent building structure on public land adjacent to their property in Habaraduwa. The construction has been ongoing for three weeks without any visible permits or official authorization. The complainant contacted the local municipal office, which confirmed that no construction permits have been issued for this location. The unauthorized construction is blocking public access to a community well that has been used by local residents for decades. Photographic evidence clearly shows the illegal construction activities.',
    caseType: 'Illegal Construction or Land Grabbing',
    caseTopic: 'Unauthorized Construction on Public Property',
    investigations: [
      { topic: 'Land Ownership and Survey Records Verification', location: 'Survey Department, Galle' },
      { topic: 'Construction Material Source and Purchase Investigation', location: 'Local hardware stores and suppliers, Habaraduwa' },
      { topic: 'Photographic Evidence and Site Documentation', location: 'Koggala Road construction site, Habaraduwa' },
      { topic: 'Municipal Permit Records and Planning Authority Inquiry', location: 'Habaraduwa Pradeshiya Sabha Office' }
    ],
    complainer: { nic: '900000010V', name: 'Ajith Kumara', phone: '0771001010', email: 'ajithk@gmail.com', address: '101 Koggala Road, Habaraduwa', dob: '1972-02-28' }
  },
  {
    description: 'Suspected child abuse and neglect case involving concerning behavioral changes and potential physical harm to minor in neighborhood.',
    evidence_details: 'The complainant has observed disturbing signs suggesting child abuse in a neighboring household in Talpe. They report seeing a young child, approximately 8 years old, with unexplained bruises, appearing malnourished, and showing signs of extreme fear when adult family members are present. The child is often heard crying loudly during night hours, and there are frequent sounds of shouting and what appears to be physical violence from the house. The complainant is deeply concerned for the child\'s welfare and safety, as these observations have been consistent over several weeks.',
    caseType: 'Child Abuse',
    caseTopic: 'Suspected Child Abuse and Neglect Investigation',
    investigations: [
      { topic: 'Child Welfare and Medical Examination', location: 'Karapitiya Teaching Hospital - Pediatric Unit' },
      { topic: 'Social Worker Assessment and Home Inspection', location: 'Suspected household, Talpe' },
      { topic: 'School Records and Teacher Interview', location: 'Talpe Primary School' },
      { topic: 'Neighborhood Witness Statement Collection', location: 'Coconut Tree Hill Road vicinity, Talpe' }
    ],
    complainer: { nic: '900000011V', name: 'Sanduni Perera', phone: '0771001011', email: 'sandunip@gmail.com', address: '22 Coconut Tree Hill Road, Talpe', dob: '1995-06-17' }
  },
  {
    description: 'Drug trafficking and illegal substance distribution activities observed near school premises endangering student safety and community welfare.',
    evidence_details: 'The complainant, who is a concerned parent and community member, has witnessed suspicious drug-related activities taking place near Weligama Primary School during school hours. They observed unknown individuals approaching students and conducting what appears to be drug transactions. The complainant has noticed an increase in discarded drug paraphernalia in the school vicinity and has observed students exhibiting unusual behavior after interacting with these suspicious individuals. This situation poses a serious threat to the safety and well-being of children in the community.',
    caseType: 'Drug Offense',
    caseTopic: 'Drug Trafficking Near Educational Institution',
    investigations: [
      { topic: 'Undercover Surveillance Operation Near School', location: 'Primary school vicinity, Weligama' },
      { topic: 'Drug Paraphernalia Collection and Forensic Analysis', location: 'School grounds and surrounding areas, Weligama' },
      { topic: 'Student and Teacher Safety Interview', location: 'Weligama Primary School' },
      { topic: 'Known Drug Dealer Database Cross-Reference', location: 'Police Narcotics Bureau, Galle' }
    ],
    complainer: { nic: '900000012V', name: 'Ruwan Fernando', phone: '0771001012', email: 'ruwanf@gmail.com', address: '77 Station Road, Weligama', dob: '1982-01-09' }
  },
  {
    description: 'Armed robbery incident at local grocery store involving multiple perpetrators using weapons and threatening staff and customers.',
    evidence_details: 'The complainant, who is the store owner, reports that three masked individuals entered their grocery store in Bentota yesterday evening around 7:00 PM armed with knives and demanded money from the cash register. The robbers threatened both the complainant and two customers who were present during the incident. They stole approximately Rs. 75,000 in cash and several cartons of cigarettes before fleeing on motorcycles. The entire incident was captured on the store\'s security camera system. The complainant and witnesses can provide detailed descriptions of the perpetrators\' physical characteristics and the motorcycles used.',
    caseType: 'Robbery',
    caseTopic: 'Armed Robbery at Commercial Establishment',
    investigations: [
      { topic: 'Security Camera Footage Analysis and Enhancement', location: 'Grocery store, Galle Road, Bentota' },
      { topic: 'Witness Statement Collection from Customers and Staff', location: 'Police station and store location, Bentota' },
      { topic: 'Motorcycle Registration and Tracking Investigation', location: 'Motor Traffic Department, Galle' },
      { topic: 'Fingerprint Analysis from Store Surfaces', location: 'Police Forensic Unit, Galle' }
    ],
    complainer: { nic: '900000013V', name: 'Nadeesha Herath', phone: '0771001013', email: 'nadeeshah@gmail.com', address: '12 Galle Road, Bentota', dob: '1984-12-25' }
  },
  {
    description: 'Multi-vehicle traffic collision involving three cars resulting in significant property damage and potential personal injuries requiring investigation.',
    evidence_details: 'The complainant was driving their vehicle when a three-car collision occurred at the main intersection near Ambalangoda town center yesterday afternoon. They state that the driver of the second vehicle ran a red light at high speed, causing a chain reaction collision involving their car and a third vehicle. The complainant sustained minor injuries and their vehicle suffered extensive damage to the front end. The reckless driver appeared to be under the influence of alcohol and fled the scene immediately after the accident, leaving behind their damaged vehicle. Several witnesses can confirm the sequence of events.',
    caseType: 'Traffic Accident',
    caseTopic: 'Multi-Vehicle Traffic Collision Investigation',
    investigations: [
      { topic: 'Traffic Camera and Intersection CCTV Analysis', location: 'Main intersection, Ambalangoda' },
      { topic: 'Vehicle Damage Assessment and Accident Reconstruction', location: 'Accident site and vehicle inspection yard, Ambalangoda' },
      { topic: 'Alcohol and Drug Testing of Suspect Driver', location: 'Police Medical Unit, Galle' },
      { topic: 'Witness Statement Collection from Bystanders', location: 'Main intersection vicinity, Ambalangoda' }
    ],
    complainer: { nic: '900000014V', name: 'Suresh Bandara', phone: '0771001014', email: 'sureshb@gmail.com', address: '33 Sea Street, Ambalangoda', dob: '1979-08-03' }
  },
  {
    description: 'Unauthorized political demonstration blocking main transportation route causing traffic disruption and preventing emergency vehicle access.',
    evidence_details: 'The complainant reports that a large group of political protesters has completely blocked the main road leading to the Balapitiya hospital and commercial district since early morning today. The demonstration appears to be unauthorized as no official permits were displayed, and the protesters are preventing all vehicular traffic from passing through this critical route. This blockage has caused severe inconvenience to commuters, delayed emergency services, and disrupted local businesses. The complainant witnessed an ambulance being forced to take a much longer alternative route, potentially endangering a patient\'s life.',
    caseType: 'Political Protest',
    caseTopic: 'Unauthorized Political Demonstration and Road Blockage',
    investigations: [
      { topic: 'Protest Organization and Leadership Identification', location: 'Main Road junction, Balapitiya' },
      { topic: 'Permit and Authorization Records Check', location: 'Balapitiya Pradeshiya Sabha and police headquarters' },
      { topic: 'Traffic Disruption Impact Assessment', location: 'Main commercial route, Balapitiya' },
      { topic: 'Emergency Services Delay Documentation', location: 'Hospital and emergency services, Balapitiya' }
    ],
    complainer: { nic: '900000015V', name: 'Lakmal Jayalath', phone: '0771001015', email: 'lakmalj@gmail.com', address: '5 Temple Road, Balapitiya', dob: '1986-11-11' }
  }
];
// Users with their complaint counts
const users = [
  { username: 'maheshperera', count: 1 },
  { username: 'ranjith.silva', count: 1 },
  { username: 'sunil.jayasinghe', count: 1 },
  { username: 'nadeesha.herath', count: 2 },
  { username: 'harshani.wickramasinghe', count: 1 },
  { username: 'ajith.kumara', count: 2 },
  { username: 'ishara.senanayake', count: 2 },
  { username: 'suresh.bandara', count: 1 },
  { username: 'ramesh.gunasekara', count: 2 },
  { username: 'kasun.fernando', count: 1 },
  { username: 'kavinda.rathnayake', count: 2 },
  { username: 'sithara.madushani', count: 2 }
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
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const complaintsToCreate = generateComplaints();
  let currentUser = '';
  let userComplaintCount = 0;
  let totalUserComplaints = 0;
  
  for (let i = 0; i < complaintsToCreate.length; i++) {
    const c = complaintsToCreate[i];

    // Check if we're starting with a new user
    if (currentUser !== c.username) {
      // If we have a previous user and completed their complaints, logout
      if (currentUser !== '' && userComplaintCount === totalUserComplaints) {
        console.log(`\n🚪 Logging out user: ${currentUser}`);
        
        // Click on profile dropdown
        await page.click('button:has-text("' + currentUser.split('.')[0] + '")');
        await page.waitForTimeout(500);
        
        // Click logout in dropdown
        await page.click('button:has-text("Sign Out")');
        await page.waitForTimeout(500);
        
        // Click confirm logout in popup
        await page.click('button:has-text("Logout")');
        await page.waitForTimeout(1000);
      }
      
      // Set new user and reset counters
      currentUser = c.username;
      userComplaintCount = 0;
      totalUserComplaints = users.find(u => u.username === c.username)?.count || 1;
      
      console.log(`\n👤 Starting with user: ${currentUser} (${totalUserComplaints} complaints to create)`);
    }

    userComplaintCount++;

    console.log(`\n=== Creating Complaint ${userComplaintCount}/${totalUserComplaints} for ${currentUser} ===`);
    console.log(`Overall: ${i + 1}/${complaintsToCreate.length}`);
    console.log(`Type: ${c.caseType}`);
    console.log(`Description: ${c.description}`);

    // Login with current user (only if we're not already logged in)
    if (userComplaintCount === 1) {
      await page.goto('http://localhost:5173/login');
      await page.waitForTimeout(1000);
      
      // Clear and fill login fields
      await page.fill('input[name="username"]', '');
      await page.fill('input[name="username"]', c.username);
      await page.fill('input[name="password"]', '');
      await page.fill('input[name="password"]', 'abcd1234');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(1000);
    }

    // Go to complaints page
    await page.goto('http://localhost:5173/complaints');
    await page.waitForTimeout(1000);
    
    // Open modal - try multiple possible button texts
    try {
      await page.click('button:has-text("Create Complaint")');
    } catch {
      try {
        await page.click('button:has-text("Create New Complaint")');
      } catch {
        await page.click('button:has-text("New Complaint")');
      }
    }
    await page.waitForTimeout(1000);

    // Wait for modal to be visible
    console.log(`Filling complaint type: ${c.caseType}`);
    await page.selectOption('select[name="complaintType"]', c.caseType);
    await page.waitForTimeout(300);


    // Fill complaint description (first textarea)
    console.log('Filling complaint description');
    await page.fill('textarea[name="description"]', c.description);
    await page.waitForTimeout(300);

    // Fill evidence details (second textarea)
    await page.fill('textarea[name="evidence_details"]', c.evidence_details);
    await page.waitForTimeout(300);

    // Fill complainer details in the right order
    await page.fill('input[name="name"]', c.complainer.name);
    await page.waitForTimeout(200);
    
    await page.fill('input[name="nic"]', c.complainer.nic);
    await page.waitForTimeout(200);
    
    await page.fill('input[name="dob"]', c.complainer.dob);
    await page.waitForTimeout(200);
    
    await page.fill('input[name="phone"]', c.complainer.phone);
    await page.waitForTimeout(200);
    
    await page.fill('input[name="email"]', c.complainer.email);
    await page.waitForTimeout(200);
      await page.fill('textarea[name="address"]', c.complainer.address);
    await page.waitForTimeout(300);

    // Auto-click the submit button to create complaint
    console.log(`✅ Form filled! Auto-clicking "Submit Complaint" button...`);
    await page.click('button:has-text("Submit Complaint")');
    
    await page.waitForSelector('text=Complaint Created Successfully', { timeout: 120000 }); // 2 minutes timeout

    // Click OK on popup to close modal
    await page.click('button:has-text("OK")');    // Wait a moment before next
    await page.waitForTimeout(1000);
    
    // If this was the last complaint for the current user, logout
    if (userComplaintCount === totalUserComplaints && i < complaintsToCreate.length - 1) {
      console.log(`\n🚪 Completed all complaints for ${currentUser}. Logging out...`);
      
      // Click on profile button (using the dropdown arrow)
      await page.click('button:has([data-testid="ArrowDropDownIcon"])');
      await page.waitForTimeout(500);
      
      // Click logout in dropdown
      await page.click('button:has-text("Sign Out")');
      await page.waitForTimeout(500);
      
      // Click confirm logout in popup
      await page.click('button:has-text("Logout")');
      await page.waitForTimeout(1000);
      
      currentUser = ''; // Reset current user
      userComplaintCount = 0; // Reset complaint count for next user
      console.log(`✅ Successfully logged out ${currentUser}`);
    }
  }

  console.log('\n✅ All complaints created successfully!');
  await browser.close();
});