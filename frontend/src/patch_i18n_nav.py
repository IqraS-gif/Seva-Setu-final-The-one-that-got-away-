import os
import re

base_path = r'c:\Users\ZAHID\Downloads\SevaSetuversion1\SevaSetuversion1\SevaSetu\frontend\src'
path_hi = os.path.join(base_path, 'i18n', 'hi.ts')
path_en = os.path.join(base_path, 'i18n', 'en.ts')

nav_hi = """
  nav: {
    Home: 'होम',
    'Tasks Map': 'कार्य मानचित्र',
    'Digital Form': 'डिजिटल फॉर्म',
    'Scan Survey': 'सर्वेक्षण स्कैन',
    Learning: 'लर्निंग',
    Profile: 'प्रोफ़ाइल',
    Reports: 'रिपोर्ट',
    'Report Issue': 'समस्या रिपोर्ट',
    'My Requests': 'मेरे अनुरोध',
    Passport: 'पासपोर्ट',
    Dashboard: 'डैशबोर्ड',
    'Crisis Heatmap': 'हीटमैप',
    Volunteers: 'स्वयंसेवक',
    'Impact Reports': 'प्रभाव रिपोर्ट',
    Settings: 'सेटिंग्स',
    Missions: 'मिशन',
  },
  demo: {
    'Village cleanings': 'गाँव की सफाई',
    'Clean Water Camp': 'स्वच्छ जल शिविर',
    'Medical Checkup': 'चिकित्सा जांच',
    'Infrastructure Repair': 'बुनियादी ढांचा मरम्मत',
    'Nagpur': 'नागपुर',
    'Wardha': 'वर्धा',
    'Amravati': 'अमरावती',
  },"""

nav_en = """
  nav: {
    Home: 'Home',
    'Tasks Map': 'Tasks Map',
    'Digital Form': 'Digital Form',
    'Scan Survey': 'Scan Survey',
    Learning: 'Learning',
    Profile: 'Profile',
    Reports: 'Reports',
    'Report Issue': 'Report Issue',
    'My Requests': 'My Requests',
    Passport: 'Passport',
    Dashboard: 'Dashboard',
    'Crisis Heatmap': 'Crisis Heatmap',
    Volunteers: 'Volunteers',
    'Impact Reports': 'Impact Reports',
    Settings: 'Settings',
    Missions: 'Missions',
  },
  demo: {
    'Village cleanings': 'Village cleanings',
    'Clean Water Camp': 'Clean Water Camp',
    'Medical Checkup': 'Medical Checkup',
    'Infrastructure Repair': 'Infrastructure Repair',
    'Nagpur': 'Nagpur',
    'Wardha': 'Wardha',
    'Amravati': 'Amravati',
  },"""

def patch(path, content):
    with open(path, 'r', encoding='utf-8') as f: text = f.read()
    if '  nav: {' in text:
        text = re.sub(r'nav: \{.*?\},\n\s+demo: \{.*?\},', content[1:], text, flags=re.DOTALL)
    else:
        text = text.replace('  calendar: {', content + '\n  calendar: {')
    with open(path, 'w', encoding='utf-8') as f: f.write(text)

patch(path_hi, nav_hi)
patch(path_en, nav_en)
print("Nav and Demo dictionaries patched")
