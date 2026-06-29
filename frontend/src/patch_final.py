import os
import re

base_path = r'c:\Users\ZAHID\Downloads\SevaSetuversion1\SevaSetuversion1\SevaSetu\frontend\src'

def patch_i18n():
    hi_path = os.path.join(base_path, 'i18n', 'hi.ts')
    en_path = os.path.join(base_path, 'i18n', 'en.ts')
    
    with open(hi_path, 'r', encoding='utf-8') as f: hi_text = f.read()
    with open(en_path, 'r', encoding='utf-8') as f: en_text = f.read()
        
    skills_hi = """
  skills: {
    first_aid: 'प्राथमिक चिकित्सा',
    medical: 'चिकित्सा',
    logistics: 'रसद सामग्री',
    driving: 'ड्राइविंग',
    teaching: 'अध्यापन',
    construction: 'निर्माण',
    documentation: 'प्रलेखन',
    cooking: 'खाना बनाना',
    crowd_management: 'भीड़ प्रबंधन',
    counseling: 'परामर्श',
  },
  survey: {
    title: 'डिजिटल सर्वेक्षण फॉर्म',
    whoAndWhere: '1. कौन और कहाँ',
    citizenName: 'नागरिक का नाम *',
    enterName: 'नाम दर्ज करें',
    phoneNumber: 'फ़ोन नंबर',
    preciseLocation: 'सटीक स्थान *',
    demographicTally: 'जनसांख्यिकीय गणना (परिवार का आकार)',
    theProblem: '2. समस्या',
    primaryCategory: 'प्राथमिक श्रेणी *',
    urgencyLevel: 'तात्कालिकता स्तर *',
    description: 'विवरण',
    describeIssue: 'समस्या का संक्षेप में वर्णन करें...',
    uploadPhotos: '3. मीडिया विवरण',
    addPhotos: 'तस्वीरें जोड़ें (वैकल्पिक)',
    submit: 'सर्वेक्षण सबमिट करें',
    submitting: 'सबमिट हो रहा है...',
    successTitle: 'सफलता',
    successMsg: 'सर्वेक्षण सफलतापूर्वक सबमिट किया गया।',
    errorTitle: 'त्रुटि',
    errorMsg: 'कृपया अनिवार्य फ़ील्ड भरें।',
  },
  demo: {
    'Village cleanings': 'गाँव की सफाई',
    'Clean Water Camp': 'स्वच्छ जल शिविर',
    'First Aid Certification': 'प्राथमिक चिकित्सा प्रमाणन',
    'Emergency: Water Logging Clearance': 'आपातकाल: जलभराव निकासी',
    'Food Distribution Drive': 'भोजन वितरण अभियान',
    'Elderly Assistance Check': 'वृद्ध सहायता जाँच',
    'Completed: Evening School Tutoring': 'पूर्ण: सांध्य विद्यालय शिक्षण',
    'Water Pipeline Burst': 'पानी की पाइपलाइन फटी',
    'Medical Assistance Required': 'चिकित्सा सहायता आवश्यक',
    'Food Supply Shortage': 'भोजन आपूर्ति की कमी',
    'Traffic Light Malfunction': 'ट्रैफिक लाइट की खराबी',
    'Stray Animal Rescue': 'आवारा पशु बचाव',
  },
  nav: {
    Home: 'मुख्य पृष्ठ',
    'Tasks Map': 'कार्य मानचित्र',
    'Digital Form': 'डिजिटल फॉर्म',
    'Scan Survey': 'स्कैन सर्वेक्षण',
    Learning: 'सीखना',
    Profile: 'प्रोफ़ाइल',
  },
  assignments: {
    title: 'मेरे कार्य',
    pending: 'लंबित',
    accepted: 'स्वीकृत',
    past: 'अतीत',
    filter: 'फ़िल्टर',
    missionsShown: 'कार्य दिखाए गए',
    directAssignment: 'प्रत्यक्ष कार्य',
    goodMatch: 'अच्छा मिलान',
    aiMatchScore: 'एआई मिलान स्कोर',
    yourMatchingSkills: 'आपके मिलान कौशल',
    fatigueBuffer: 'कार्यभार क्षमता',
    viewAiReasoning: 'एआई तर्क देखें',
    reject: 'अस्वीकार करें',
    acceptMission: 'मिशन स्वीकार करें',
  },
"""

    skills_en = """
  skills: {
    first_aid: 'First Aid',
    medical: 'Medical',
    logistics: 'Logistics',
    driving: 'Driving',
    teaching: 'Teaching',
    construction: 'Construction',
    documentation: 'Documentation',
    cooking: 'Cooking',
    crowd_management: 'Crowd Mgmt',
    counseling: 'Counseling',
  },
  survey: {
    title: 'Digital Survey Form',
    whoAndWhere: '1. Who & Where',
    citizenName: 'Citizen Name *',
    enterName: 'Enter name',
    phoneNumber: 'Phone Number',
    preciseLocation: 'Precise Location *',
    demographicTally: 'Demographic Tally (Household Size)',
    theProblem: '2. The Problem',
    primaryCategory: 'Primary Category *',
    urgencyLevel: 'Urgency Level *',
    description: 'Description',
    describeIssue: 'Briefly describe the issue...',
    uploadPhotos: '3. Media Evidence',
    addPhotos: 'Add Photos (Optional)',
    submit: 'Submit Survey',
    submitting: 'Submitting...',
    successTitle: 'Success',
    successMsg: 'Survey submitted successfully.',
    errorTitle: 'Error',
    errorMsg: 'Please fill all mandatory fields.',
  },
  demo: {
    'Village cleanings': 'Village cleanings',
    'Clean Water Camp': 'Clean Water Camp',
    'First Aid Certification': 'First Aid Certification',
    'Emergency: Water Logging Clearance': 'Emergency: Water Logging Clearance',
    'Food Distribution Drive': 'Food Distribution Drive',
    'Elderly Assistance Check': 'Elderly Assistance Check',
    'Completed: Evening School Tutoring': 'Completed: Evening School Tutoring',
    'Water Pipeline Burst': 'Water Pipeline Burst',
    'Medical Assistance Required': 'Medical Assistance Required',
    'Food Supply Shortage': 'Food Supply Shortage',
    'Traffic Light Malfunction': 'Traffic Light Malfunction',
    'Stray Animal Rescue': 'Stray Animal Rescue',
  },
  nav: {
    Home: 'Home',
    'Tasks Map': 'Tasks Map',
    'Digital Form': 'Digital Form',
    'Scan Survey': 'Scan Survey',
    Learning: 'Learning',
    Profile: 'Profile',
  },
  assignments: {
    title: 'My Assignments',
    pending: 'Pending',
    accepted: 'Accepted',
    past: 'Past',
    filter: 'Filter',
    missionsShown: 'missions shown',
    directAssignment: 'DIRECT ASSIGNMENT',
    goodMatch: 'Good Match',
    aiMatchScore: 'AI Match Score',
    yourMatchingSkills: 'YOUR MATCHING SKILLS',
    fatigueBuffer: 'fatigue buffer',
    viewAiReasoning: 'View AI Reasoning',
    reject: 'Reject',
    acceptMission: 'Accept Mission',
  },
"""

    if 'skills: {' not in hi_text:
        hi_text = hi_text.replace("export const hi = {", "export const hi = {\n" + skills_hi)
        with open(hi_path, 'w', encoding='utf-8') as f: f.write(hi_text)

    if 'skills: {' not in en_text:
        en_text = en_text.replace("export const en = {", "export const en = {\n" + skills_en)
        with open(en_path, 'w', encoding='utf-8') as f: f.write(en_text)

def patch_tab_bar():
    p = os.path.join(base_path, 'navigation', 'AnimatedTabBar.tsx')
    with open(p, 'r', encoding='utf-8') as f: text = f.read()

    if "const finalLabel = t" not in text:
        if 'useLanguage' not in text:
            text = "import { useLanguage } from '../context/LanguageContext';\n" + text
        
        text = text.replace("export function AnimatedTabBar({ state, descriptors, navigation }: any) {", "export function AnimatedTabBar({ state, descriptors, navigation }: any) {\n  const { t } = useLanguage();")
        
        # We need to find the map closure: state.routes.map((route, index) => { Let's just find the label derivation:
        text = text.replace(
            "const label =\n        options.tabBarLabel !== undefined\n          ? options.tabBarLabel\n          : options.title !== undefined\n          ? options.title\n          : route.name;",
            "const rawLabel =\n        options.tabBarLabel !== undefined\n          ? options.tabBarLabel\n          : options.title !== undefined\n          ? options.title\n          : route.name;\n      const finalLabel = t(`nav.${rawLabel}`) !== `nav.${rawLabel}` ? t(`nav.${rawLabel}`) : rawLabel;"
        )
        
        # Now replace {label} in JSX with {finalLabel}
        text = text.replace(">{label as string}<", ">{finalLabel as string}<")
        text = text.replace(">{label}<", ">{finalLabel}<")
        
        with open(p, 'w', encoding='utf-8') as f: f.write(text)

def patch_assignments():
    p = os.path.join(base_path, 'screens', 'volunteer', 'AssignmentScreen.tsx')
    if not os.path.exists(p): return
    with open(p, 'r', encoding='utf-8') as f: text = f.read()
    
    if 'useLanguage' not in text:
        text = "import { useLanguage } from '../../context/LanguageContext';\n" + text
    
    if 'const { t } = useLanguage();' not in text:
        text = re.sub(r'(export const AssignmentScreen = [^\{]+\{)', r'\1\n  const { t } = useLanguage();', text)

    replacements = [
        (">My Assignments<", ">{t('assignments.title')}<"),
        (">Pending", ">{t('assignments.pending')}"),
        (">Accepted", ">{t('assignments.accepted')}"),
        (">Past<", ">{t('assignments.past')}<"),
        (">Filter<", ">{t('assignments.filter')}<"),
        (" missions shown", " {t('assignments.missionsShown')}"),
        (">DIRECT ASSIGNMENT<", ">{t('assignments.directAssignment')}<"),
        (">Good Match<", ">{t('assignments.goodMatch')}<"),
        (">AI Match Score<", ">{t('assignments.aiMatchScore')}<"),
        (">YOUR MATCHING SKILLS<", ">{t('assignments.yourMatchingSkills')}<"),
        (">fatigue buffer", ">{t('assignments.fatigueBuffer')}"),
        (">View AI Reasoning", ">{t('assignments.viewAiReasoning')}"),
        (">Reject<", ">{t('assignments.reject')}<"),
        (">Accept Mission<", ">{t('assignments.acceptMission')}<"),
        # Translate the demo titles here too
        ("title={item.title}", "title={t(`demo.${item.title}`) !== `demo.${item.title}` ? t(`demo.${item.title}`) : item.title}"),
    ]
    for o, n in replacements:
        text = text.replace(o, n)
        
    with open(p, 'w', encoding='utf-8') as f: f.write(text)

patch_i18n()
patch_tab_bar()
patch_assignments()
print("Final patches applied")
