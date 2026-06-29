import os
import re

base_path = r'c:\Users\ZAHID\Downloads\SevaSetuversion1\SevaSetuversion1\SevaSetu\frontend\src'
path_hi = os.path.join(base_path, 'i18n', 'hi.ts')
path_en = os.path.join(base_path, 'i18n', 'en.ts')

new_hi = """
  assignments: {
    pending: 'लंबित',
    accepted: 'स्वीकृत',
    past: 'पुराने',
    loading: 'असाइनमेंट लोड हो रहे हैं...',
    noPendingMissions: 'कोई लंबित मिशन नहीं',
    noPendingSubtitle: 'वर्तमान में आपकी प्रोफ़ाइल से मेल खाने वाला कोई लाइव कार्यक्रम नहीं है। अपना कौशल अपडेट करें या तब तक प्रतीक्षा करें जब तक कोई पर्यवेक्षक नया मिशन नहीं भेजता।',
    noAcceptedAssignments: 'कोई स्वीकृत असाइनमेंट नहीं',
    noAcceptedSubtitle: 'आपके द्वारा स्वीकार किए गए मिशन यहाँ दिखाई देंगे।',
    noPastAssignments: 'कोई पुराना असाइनमेंट नहीं',
    noPastSubtitle: 'आपका पुराना असाइनमेंट इतिहास यहाँ दिखाई देगा।',
    noResults: 'इन फिल्टरों के लिए कोई परिणाम नहीं',
    tryRelaxing: 'अपने थ्रेशोल्ड को कम करने या कम कौशल चुनने का प्रयास करें।',
    resetFilters: 'सभी फिल्टर रीसेट करें',
    missionsShown: 'मिशन दिखाए गए',
    missionShown: 'मिशन दिखाया गया',
    clearAll: 'सभी साफ करें',
    filter: 'फिल्टर',
    reset: 'रीसेट',
    filtersTitle: 'फिल्टर',
    minThresholds: 'न्यूनतम थ्रेशोल्ड',
    skillMatch: 'कौशल मैच',
    availability: 'उपलब्धता',
    areaMatch: 'क्षेत्र मैच',
    overallAiScore: 'कुल AI स्कोर',
    any: 'कोई भी',
    filterBySkills: 'आवश्यक कौशलों द्वारा फिल्टर करें',
    applyFilters: 'फिल्टर लागू करें',
    directAssignment: '🎯 सीधा असाइनमेंट',
    excellentMatch: 'उत्कृष्ट मैच',
    goodMatch: 'अच्छा मैच',
    partialMatch: 'आंशिक मैच',
    supervisor: 'पर्यवेक्षक',
    me: 'स्वयं',
    directDesc: 'पर्यवेक्षक ने आपकी प्रोफ़ाइल के आधार पर विशेष रूप से आपको इस मिशन के लिए चुना है।',
    matchingSkills: 'आपके मिलान वाले कौशल',
    generalVolunteer: 'सामान्य स्वयंसेवक आवश्यक',
    accept: 'मिशन स्वीकार करें',
    join: 'मिशन में शामिल हों',
    reject: 'अस्वीकार करें',
    acceptedLabel: '✅ स्वीकृत',
    declinedLabel: '❌ अस्वीकृत',
    areaTbd: 'क्षेत्र तय होना बाकी',
    aiReasoningTitle: '🤖 AI मैच तर्क',
    aiReasoningSub: 'मिशन विवरणों के पुनः सत्यापन के बाद पूर्ण AI औचित्य दिखाई देगा।',
    gotIt: 'ठीक है',
    aiMatchScore: 'AI मैच स्कोर',
    viewAiReasoning: 'AI तर्क देखें',
  },"""

new_en = """
  assignments: {
    pending: 'Pending',
    accepted: 'Accepted',
    past: 'Past',
    loading: 'Loading assignments...',
    noPendingMissions: 'No Pending Missions',
    noPendingSubtitle: 'There are no live events matching your profile at the moment. Update your skills or check back when a supervisor dispatches a new mission.',
    noAcceptedAssignments: 'No Accepted Assignments',
    noAcceptedSubtitle: 'Missions you accept will appear here.',
    noPastAssignments: 'No Past Assignments',
    noPastSubtitle: 'Your assignment history will appear here.',
    noResults: 'No results for these filters',
    tryRelaxing: 'Try relaxing your thresholds or selecting fewer skills.',
    resetFilters: 'Reset All Filters',
    missionsShown: 'missions shown',
    missionShown: 'mission shown',
    clearAll: 'Clear All',
    filter: 'Filter',
    reset: 'Reset',
    filtersTitle: 'Filters',
    minThresholds: 'Minimum Thresholds',
    skillMatch: 'Skill Match',
    availability: 'Availability',
    areaMatch: 'Area Match',
    overallAiScore: 'Overall AI Score',
    any: 'Any',
    filterBySkills: 'Filter by Required Skills',
    applyFilters: 'Apply Filters',
    directAssignment: '🎯 DIRECT ASSIGNMENT',
    excellentMatch: 'Excellent Match',
    goodMatch: 'Good Match',
    partialMatch: 'Partial Match',
    supervisor: 'Supervisor',
    me: 'Me',
    directDesc: 'The supervisor has specifically selected you for this mission based on your profile.',
    matchingSkills: 'Your Matching Skills',
    generalVolunteer: 'General Volunteer Required',
    accept: 'Accept Mission',
    join: 'Join Mission',
    reject: 'Reject',
    acceptedLabel: '✅ Accepted',
    declinedLabel: '❌ Declined',
    areaTbd: 'Area TBD',
    aiReasoningTitle: '🤖 AI Match Reasoning',
    aiReasoningSub: 'Full AI justification will appear once the mission details are re-verified by the dispatcher.',
    gotIt: 'Got it',
    aiMatchScore: 'AI Match Score',
    viewAiReasoning: 'View AI Reasoning',
  },"""

def patch(path, content):
    with open(path, 'r', encoding='utf-8') as f: text = f.read()
    if 'assignments: {' in text:
        text = re.sub(r'assignments: \{.*?\},\n', content[1:] + '\n', text, flags=re.DOTALL)
    else:
        text = text.replace('  nav: {', content + '\n  nav: {')
    with open(path, 'w', encoding='utf-8') as f: f.write(text)

patch(path_hi, new_hi)
patch(path_en, new_en)
print("Dictionaries patched successfully")
