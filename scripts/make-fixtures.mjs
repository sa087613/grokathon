// Regenerates /fixtures. Everything here is invented demo data: no real firm, recall or ordinance.
import fs from 'node:fs';

const f = (firm, product, reason, dist, cls, days, n) => ({ recall_number: `F-${1000 + n}-2026`, recalling_firm: firm, product_description: product, reason_for_recall: reason, distribution_pattern: dist, classification: cls, report_date: `{{ymd-${days}}}`, code_info: `Lots ${n}A through ${n}F` });
const recalls = [
  ['Sunbelt Produce Co', 'Diced yellow onions, 5 lb foodservice bag; Sliced red onions, 5 lb foodservice bag; Pico base mix, 2 lb tub', 'Potential Salmonella contamination', 'GA, AL, SC, TN foodservice distributors', 'Class I', 0],
  ['Red Clay Tortilla', 'Corn tortillas, 6 inch, 80 count; Street taco tortillas, 4 inch, 100 count', 'Undeclared wheat', 'Georgia restaurants and wholesale', 'Class II', 1],
  ['Prairie Lake Dairy', 'Shredded Monterey Jack, 5 lb foodservice bags', 'Potential Listeria monocytogenes', 'Nationwide wholesale and foodservice', 'Class I', 2],
  ['Harbor North Seafood', 'Frozen cod fillets', 'Temperature abuse in transit', 'WA, OR, ID retail stores', 'Class II', 1],
  ['Maple Hollow Bakery', 'Blueberry muffins, 4 pack', 'Undeclared milk', 'VT, NH, ME retail', 'Class II', 2],
  ['Golden Mesa Snacks', 'Kettle potato chips, 2 oz', 'Undeclared soy', 'AZ, NM retail', 'Class III', 3],
  ['Northwind Beverages', 'Sparkling lemonade, 12 oz cans', 'Under-processing', 'MN, WI, IA retail', 'Class II', 3],
  ['Tidewater Pickle Works', 'Bread and butter pickles, 16 oz', 'Foreign material, glass', 'VA, MD retail', 'Class II', 4],
  ['Sierra Nut Company', 'Roasted almonds, 8 oz', 'Potential Salmonella', 'CA, NV retail', 'Class I', 4],
  ['Lone Oak Farms', 'Liquid egg whites, 32 oz', 'Off-odor reported', 'TX, OK retail', 'Class III', 5],
  ['Evergreen Sprouts', 'Alfalfa sprouts, 4 oz', 'Potential E. coli O157', 'OR retail', 'Class I', 5],
  ['Great Plains Grain', 'Rolled oats, 42 oz', 'Undeclared wheat', 'KS, NE retail', 'Class II', 6],
  ['Bayou Spice House', 'Cajun seasoning, 6 oz', 'Elevated lead', 'LA, MS retail', 'Class II', 6],
  ['Cold Spring Creamery', 'Vanilla ice cream, pints', 'Foreign material, metal', 'NY, NJ retail', 'Class II', 7],
].map((r, i) => f(...r, i + 1));
const upc = (b) => { const d = [...b].map(Number); const sum = d.reduce((a, x, i) => a + x * (i % 2 ? 1 : 3), 0); return b + (10 - (sum % 10)) % 10; };
recalls[0].code_info = `Best by {{long+18}}. UPC ${upc('84120300417')}`;
recalls[1].code_info = `Best by {{long+9}}. UPC ${upc('85006200138')}`;
fs.writeFileSync('fixtures/openfda.json', JSON.stringify({ results: recalls }, null, 2));

const rss = [
  ['Blue Ridge Poultry recalls frozen chicken thighs for possible Listeria', 'Blue Ridge Poultry is recalling frozen boneless chicken thighs sold to restaurants in Georgia and North Carolina.', 1],
  ['Old South Spice recalls ground cumin for elevated lead', 'Old South Spice is recalling 1 lb foodservice bags of ground cumin distributed nationwide.', 3],
  ['Coastal Greens recalls bagged romaine for possible E. coli', 'Coastal Greens romaine distributed to wholesale foodservice accounts in Georgia and Florida.', 2],
  ['Willow Creek recalls baby food pouches', 'Pouches sold at retail in the Midwest.', 3],
  ['Happy Paws recalls dog treats for Salmonella', 'Pet treats sold online.', 4],
  ['Alpine Chocolate recalls dark bars for undeclared milk', 'Sold through specialty retailers in Colorado.', 5],
  ['Sunrise Smoothie recalls frozen fruit blend', 'Sold at retail in Oregon and Washington.', 6],
  ['Vital Nutra recalls protein powder for undeclared peanut', 'Sold online to consumers.', 7],
].map(([t, d, n]) => `<item><title>${t}</title><link>https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts</link><description>${d}</description><pubDate>{{iso-${n}}}T12:00:00Z</pubDate></item>`);
fs.writeFileSync('fixtures/fda-rss.xml', `<?xml version="1.0"?>\n<rss version="2.0"><channel><title>Recalls</title>\n${rss.join('\n')}\n</channel></rss>\n`);

const council = [
  ['Ordinance 26-O-1412: amending the mobile food vending zones in the Downtown Improvement District', 'fixture:26-O-1412-staff-report.pdf', 2, 'Staff report attached. Sponsor: Zoning Committee.'],
  ['Resolution 26-R-3380: approving municipal bond refunding for Department of Watershed Management', 'fixture:26-R-3380-staff-report.pdf', 2, 'Staff report attached. Sponsor: Finance Committee.'],
  ['Ordinance 26-O-1420: creating a food truck parking pilot near MARTA stations', '#', 1, 'Pilot for mobile food vending at three stations. Public comment open until {{long+12}}.'],
  ['Ordinance 26-O-1431: grease trap inspection schedule for food service establishments', '#', 3, 'Applies to food service establishments connected to city sewer.'],
  ['Resolution 26-R-3391: commissary kitchen zoning study', '#', 4, 'Requests a planning study of commissary kitchen locations.'],
  ['Ordinance 26-O-1401: rezoning 800 Ralph McGill Blvd', '#', 4, 'Zoning change, MRC-2 to MRC-3.'],
  ['Ordinance 26-O-1402: rezoning 2200 Peachtree Rd', '#', 4, 'Zoning change for mixed use.'],
  ['Resolution 26-R-3360: proclamation honoring Grady High School debate team', '#', 5, 'Ceremonial.'],
  ['Resolution 26-R-3361: proclamation for Atlanta Beltline volunteers', '#', 5, 'Ceremonial.'],
  ['Resolution 26-R-3362: authorizing fleet vehicle purchase', '#', 5, 'Procurement for Department of Public Works.'],
  ['Resolution 26-R-3363: accepting library grant', '#', 6, 'Grant acceptance.'],
  ['Ordinance 26-O-1403: amending parking meter rates in Midtown', '#', 6, 'Adjusts meter rates on selected blocks.'],
  ['Resolution 26-R-3364: appointing members to the Tree Conservation Commission', '#', 6, 'Appointments.'],
  ['Resolution 26-R-3365: authorizing airport concessions lease', '#', 7, 'Lease at Hartsfield-Jackson.'],
  ['Ordinance 26-O-1404: stormwater utility billing clarification', '#', 7, 'Technical amendment.'],
  ['Resolution 26-R-3366: transfer of funds for recreation centers', '#', 7, 'Budget transfer.'],
  ['Ordinance 26-O-1405: short-term rental licence renewal cycle', '#', 8, 'Housing licence change.'],
  ['Resolution 26-R-3367: authorizing public safety training contract', '#', 8, 'Professional services.'],
];
fs.writeFileSync('fixtures/council/agenda.html', `<!doctype html><html><body><main><h1>Full Council agenda</h1><ul>\n${council.map(([t, h, d, c]) => `<li><time datetime="{{iso-${d}}}">{{long-${d}}}</time> <a href="${h}">${t}</a> <p>${c}</p></li>`).join('\n')}\n</ul></main></body></html>\n`);

const n = (id, source, title, days, rawText) => ({ id: `page:${id}`, source, title, url: source === 'county-health' ? 'https://fultoncountyboh.com/' : 'https://www.atlantaga.gov/', publishedAt: `{{iso-${days}}}`, rawText });
const A = 'atlanta-notices', H = 'county-health';
const notices = [
  n('n1', A, 'Mobile food vending permit renewal window opens', 1, 'The City of Atlanta will accept mobile food vending permit renewals online. Renewals must be filed by {{long+21}}.'),
  n('n2', A, 'Atlanta Police vendor permit: new photo ID requirement', 2, 'Vendor permit holders must present updated photo ID for each employee working a food truck.'),
  n('n3', A, 'Howell Mill Rd lane closure for water main work', 1, 'Northbound Howell Mill Rd reduced to one lane from {{long+3}}. Expect delays near Chattahoochee Ave.'),
  n('n4', A, 'Edgewood Ave milling and paving overnight', 0, 'Curb lane on Edgewood Ave NE closed for milling beginning {{long+5}}. Curbside parking removed.'),
  n('n5', A, 'Krog Street detour for bridge inspection', 2, 'Krog Street tunnel approach detour beginning {{long+2}}.'),
  n('n6', A, 'Moreland Ave milling project phase two', 1, 'Milling on Moreland Ave north of I-20.'),
  n('n7', A, 'Northside Dr water main repair closure', 3, 'Lane closure at Northside Dr and 14th St.'),
  n('n8', A, 'Moreland Ave milling project', 3, 'Milling on Moreland Ave south of I-20.'),
  n('n9', A, 'Piedmont Rd detour for gas line work', 4, 'Detour on Piedmont Rd near Lindbergh.'),
  n('n10', A, 'Peachtree Rd paving schedule', 4, 'Overnight paving on Peachtree Rd in Buckhead.'),
  n('n11', A, 'Boulevard lane closure', 5, 'Lane closure on Boulevard NE near Ponce.'),
  n('n12', A, 'Sign permit fee schedule update', 5, 'New fee schedule for commercial sign permits.'),
  n('n13', A, 'Sidewalk cafe permit guidance for restaurants', 3, 'Updated guidance for restaurants using sidewalk seating.'),
  n('n14', H, 'Fulton County Board of Health: mobile food unit fee increase', 1, 'Fulton County Board of Health will raise the annual mobile food unit permit fee effective {{long+30}}.'),
  n('n15', H, 'Fulton County Board of Health: commissary log rule for mobile units', 2, 'Mobile food units must keep a dated commissary servicing log on board, effective {{long+45}}.'),
  n('n16', H, 'DeKalb County Board of Health: mobile food unit inspection form revised', 3, 'DeKalb County Board of Health revised its mobile food inspection checklist for units operating in the county.'),
  n('n17', H, 'Fulton County Board of Health: allergen training reminder for food service', 4, 'Reminder to all food service establishments about allergen awareness training.'),
  n('n18', H, 'Cobb County Board of Health: pool inspection fee update', 4, 'Cobb County pool inspection fee schedule revised.'),
  n('n19', H, 'Gwinnett County Board of Health: mobile unit plan review change', 5, 'Gwinnett County plan review now online.'),
  n('n20', H, 'DeKalb County Board of Health: tattoo studio rule update', 6, 'Body art studio rule change.'),
];
fs.writeFileSync('fixtures/pages/notices.json', JSON.stringify(notices, null, 2));

// Deterministic street jobs around the demo truck's base and commissary.
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const STREETS = ['Edgewood Ave NE', 'Krog St NE', 'DeKalb Ave NE', 'Decatur St SE', 'Boulevard NE', 'Irwin St NE', 'Howell Mill Rd NW', 'Chattahoochee Ave NW', 'Marietta St NW', 'Huff Rd NW'];
const WORK = { street: 'Utility trench and lane closure', repaving: 'Mill and overlay', nodig: 'No excavation allowed after recent paving', building: 'Building permit with sidewalk staging' };
const KINDS = [...Array(14).fill('street'), ...Array(4).fill('repaving'), ...Array(8).fill('nodig'), ...Array(22).fill('building')];
const jobs = KINDS.map((kind, i) => {
  const west = i % 3 === 0;
  const street = STREETS[(west ? 6 : 0) + Math.floor(rnd() * (west ? 4 : 6))];
  return { id: i + 1, kind, street, detail: WORK[kind], lat: +((west ? 33.8035 : 33.7545) + (rnd() - 0.5) * 0.012).toFixed(5), lng: +((west ? -84.4125 : -84.3645) + (rnd() - 0.5) * 0.014).toFixed(5), validThrough: `{{iso+${5 + Math.floor(rnd() * 80)}}}` };
});
fs.writeFileSync('fixtures/street-jobs.json', JSON.stringify(jobs, null, 1));

function pdf(lines) {
  const content = `BT /F1 11 Tf 50 740 Td 15 TL\n${lines.map((l) => `(${l.replace(/[()\\]/g, '\\$&')}) Tj T*`).join('\n')}\nET`;
  const objs = ['<</Type/Catalog/Pages 2 0 R>>', '<</Type/Pages/Kids[3 0 R]/Count 1>>', '<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>', `<</Length ${content.length}>>\nstream\n${content}\nendstream`, '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>'];
  let out = '%PDF-1.4\n';
  const offsets = objs.map((o, i) => { const at = out.length; out += `${i + 1} 0 obj\n${o}\nendobj\n`; return at; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`;
  return out;
}
const filler = (s) => Array.from({ length: 30 }, (_, i) => `Section ${i + 1}. ${s}`);
fs.writeFileSync('fixtures/council/26-O-1412-staff-report.pdf', pdf(['Staff report: Ordinance 26-O-1412', 'Mobile food vending zones in the Downtown Improvement District.', 'Vendors must re-register their vending location by {{long+18}}.', 'Food truck operators without a registered zone lose downtown access.', ...filler('Boundary description of the mobile food vending zone and enforcement detail.')]));
fs.writeFileSync('fixtures/council/26-R-3380-staff-report.pdf', pdf(['Staff report: Resolution 26-R-3380', 'Refunding of watershed revenue bonds.', ...filler('Debt service schedule and bond counsel opinion detail.')]));
