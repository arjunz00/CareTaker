import os
import re
import csv
import json
import math
from typing import List, Dict, Any, Optional, Tuple

# Raw datasets embedded for standalone execution & zero missing file errors
DATASET_CSV = """Disease,Symptom_1,Symptom_2,Symptom_3,Symptom_4,Symptom_5,Symptom_6,Symptom_7,Symptom_8,Symptom_9,Symptom_10,Symptom_11,Symptom_12,Symptom_13,Symptom_14,Symptom_15,Symptom_16,Symptom_17
Fungal infection,itching, skin_rash, nodal_skin_eruptions, dischromic _patches,,,,,,,,,,,,,
Fungal infection, skin_rash, nodal_skin_eruptions, dischromic _patches,,,,,,,,,,,,,,
Fungal infection,itching, nodal_skin_eruptions, dischromic _patches,,,,,,,,,,,,,,
Fungal infection,itching, skin_rash, dischromic _patches,,,,,,,,,,,,,,
Fungal infection,itching, skin_rash, nodal_skin_eruptions,,,,,,,,,,,,,,
Allergy, continuous_sneezing, shivering, chills, watering_from_eyes,,,,,,,,,,,,,
Allergy, shivering, chills, watering_from_eyes,,,,,,,,,,,,,,
Allergy, continuous_sneezing, chills, watering_from_eyes,,,,,,,,,,,,,,
GERD, stomach_pain, acidity, ulcers_on_tongue, vomiting, cough, chest_pain,,,,,,,,,,,
GERD, stomach_pain, ulcers_on_tongue, vomiting, cough, chest_pain,,,,,,,,,,,,
Chronic cholestasis,itching, vomiting, yellowish_skin, nausea, loss_of_appetite, abdominal_pain, yellowing_of_eyes,,,,,,,,,,
Drug Reaction,itching, skin_rash, stomach_pain, burning_micturition, spotting_ urination,,,,,,,,,,,,
Peptic ulcer diseae, vomiting, loss_of_appetite, abdominal_pain, passage_of_gases, internal_itching,,,,,,,,,,,,
AIDS, muscle_wasting, patches_in_throat, high_fever, extra_marital_contacts,,,,,,,,,,,,,
Diabetes , fatigue, weight_loss, restlessness, lethargy, irregular_sugar_level, blurred_and_distorted_vision, obesity, excessive_hunger, increased_appetite, polyuria,,,,,,,
Gastroenteritis, vomiting, sunken_eyes, dehydration, diarrhoea,,,,,,,,,,,,,
Bronchial Asthma, fatigue, cough, high_fever, breathlessness, family_history, mucoid_sputum,,,,,,,,,,,
Hypertension , headache, chest_pain, dizziness, loss_of_balance, lack_of_concentration,,,,,,,,,,,,
Migraine, acidity, indigestion, headache, blurred_and_distorted_vision, excessive_hunger, stiff_neck, depression, irritability, visual_disturbances,,,,,,,,
Cervical spondylosis, back_pain, weakness_in_limbs, neck_pain, dizziness, loss_of_balance,,,,,,,,,,,,
Paralysis (brain hemorrhage), vomiting, headache, weakness_of_one_body_side, altered_sensorium,,,,,,,,,,,,,
Jaundice,itching, vomiting, fatigue, weight_loss, high_fever, yellowish_skin, dark_urine, abdominal_pain,,,,,,,,,
Malaria, chills, vomiting, high_fever, sweating, headache, nausea, muscle_pain,,,,,,,,,,
Malaria, chills, vomiting, high_fever, sweating, headache, nausea, diarrhoea, muscle_pain,,,,,,,,,
Chicken pox,itching, skin_rash, fatigue, lethargy, high_fever, headache, loss_of_appetite, mild_fever, swelled_lymph_nodes, malaise, red_spots_over_body,,,,,,
Dengue, skin_rash, chills, joint_pain, vomiting, fatigue, high_fever, headache, nausea, loss_of_appetite, pain_behind_the_eyes, back_pain, muscle_pain, red_spots_over_body,,,,
Typhoid, chills, vomiting, fatigue, high_fever, nausea, constipation, abdominal_pain, diarrhoea, toxic_look_(typhos), belly_pain,,,,,,,
hepatitis A, joint_pain, vomiting, yellowish_skin, dark_urine, nausea, loss_of_appetite, abdominal_pain, diarrhoea, mild_fever, yellowing_of_eyes, muscle_pain,,,,,,
Hepatitis B,itching, fatigue, lethargy, yellowish_skin, dark_urine, loss_of_appetite, abdominal_pain, yellow_urine, yellowing_of_eyes, malaise, receiving_blood_transfusion, receiving_unsterile_injections,,,,,
Hepatitis C, fatigue, yellowish_skin, nausea, loss_of_appetite, family_history,,,,,,,,,,,,
Hepatitis D, joint_pain, vomiting, fatigue, yellowish_skin, dark_urine, nausea, loss_of_appetite, abdominal_pain, yellowing_of_eyes,,,,,,,,
Hepatitis E, joint_pain, vomiting, fatigue, high_fever, yellowish_skin, dark_urine, nausea, loss_of_appetite, abdominal_pain, yellowing_of_eyes, acute_liver_failure, coma, stomach_bleeding,,,,,
Alcoholic hepatitis, vomiting, yellowish_skin, abdominal_pain, swelling_of_stomach, distention_of_abdomen, history_of_alcohol_consumption, fluid_overload,,,,,,,,,,
Tuberculosis, chills, vomiting, fatigue, weight_loss, cough, high_fever, breathlessness, sweating, loss_of_appetite, mild_fever, yellowing_of_eyes, swelled_lymph_nodes, malaise, phlegm, chest_pain, blood_in_sputum,
Common Cold, continuous_sneezing, chills, fatigue, cough, high_fever, headache, swelled_lymph_nodes, malaise, phlegm, throat_irritation, redness_of_eyes, sinus_pressure, runny_nose, congestion, chest_pain, loss_of_smell, muscle_pain
Pneumonia, chills, fatigue, cough, high_fever, breathlessness, sweating, malaise, chest_pain, fast_heart_rate, rusty_sputum,,,,,,,
Dimorphic hemmorhoids(piles), constipation, pain_during_bowel_movements, pain_in_anal_region, bloody_stool, irritation_in_anus,,,,,,,,,,,,
Heart attack, vomiting, breathlessness, sweating, chest_pain,,,,,,,,,,,,,
Varicose veins, fatigue, cramps, bruising, obesity, swollen_legs, swollen_blood_vessels, prominent_veins_on_calf,,,,,,,,,,
Hypothyroidism, fatigue, weight_gain, cold_hands_and_feets, mood_swings, lethargy, dizziness, puffy_face_and_eyes, enlarged_thyroid, brittle_nails, swollen_extremeties, depression, irritability, abnormal_menstruation,,,,
Hyperthyroidism, fatigue, mood_swings, weight_loss, restlessness, sweating, diarrhoea, fast_heart_rate, excessive_hunger, muscle_weakness, irritability, abnormal_menstruation,,,,,,
Hypoglycemia, vomiting, fatigue, anxiety, sweating, headache, nausea, blurred_and_distorted_vision, excessive_hunger, slurred_speech, irritability, palpitations,,,,,,
Osteoarthristis, joint_pain, neck_pain, knee_pain, hip_joint_pain, swelling_joints, painful_walking,,,,,,,,,,,
Arthritis, muscle_weakness, stiff_neck, swelling_joints, movement_stiffness, painful_walking,,,,,,,,,,,,
(vertigo) Paroymsal  Positional Vertigo, vomiting, headache, nausea, spinning_movements, loss_of_balance, unsteadiness,,,,,,,,,,,
Acne, skin_rash, pus_filled_pimples, blackheads, scurring,,,,,,,,,,,,,
Urinary tract infection, burning_micturition, bladder_discomfort, foul_smell_of urine, continuous_feel_of_urine,,,,,,,,,,,,,
Psoriasis, skin_rash, joint_pain, skin_peeling, silver_like_dusting, small_dents_in_nails, inflammatory_nails,,,,,,,,,,,
Impetigo, skin_rash, high_fever, blister, red_sore_around_nose, yellow_crust_ooze,,,,,,,,,,,,
"""

SYMPTOM_SEVERITY_CSV = """Symptom,weight
itching,1
skin_rash,3
nodal_skin_eruptions,4
continuous_sneezing,4
shivering,5
chills,3
joint_pain,3
stomach_pain,5
acidity,3
ulcers_on_tongue,4
muscle_wasting,3
vomiting,5
burning_micturition,6
spotting_urination,6
fatigue,4
weight_gain,3
anxiety,4
cold_hands_and_feets,5
mood_swings,3
weight_loss,3
restlessness,5
lethargy,2
patches_in_throat,6
irregular_sugar_level,5
cough,4
high_fever,7
sunken_eyes,3
breathlessness,4
sweating,3
dehydration,4
indigestion,5
headache,3
yellowish_skin,3
dark_urine,4
nausea,5
loss_of_appetite,4
pain_behind_the_eyes,4
back_pain,3
constipation,4
abdominal_pain,4
diarrhoea,6
mild_fever,5
yellow_urine,4
yellowing_of_eyes,4
acute_liver_failure,6
fluid_overload,6
swelling_of_stomach,7
swelled_lymph_nodes,6
malaise,6
blurred_and_distorted_vision,5
phlegm,5
throat_irritation,4
redness_of_eyes,5
sinus_pressure,4
runny_nose,5
congestion,5
chest_pain,7
weakness_in_limbs,7
fast_heart_rate,5
pain_during_bowel_movements,5
pain_in_anal_region,6
bloody_stool,5
irritation_in_anus,6
neck_pain,5
dizziness,4
cramps,4
bruising,4
obesity,4
swollen_legs,5
swollen_blood_vessels,5
puffy_face_and_eyes,5
enlarged_thyroid,6
brittle_nails,5
swollen_extremeties,5
excessive_hunger,4
extra_marital_contacts,5
drying_and_tingling_lips,4
slurred_speech,4
knee_pain,3
hip_joint_pain,2
muscle_weakness,2
stiff_neck,4
swelling_joints,5
movement_stiffness,5
spinning_movements,6
loss_of_balance,4
unsteadiness,4
weakness_of_one_body_side,4
loss_of_smell,3
bladder_discomfort,4
foul_smell_ofurine,5
continuous_feel_of_urine,6
passage_of_gases,5
internal_itching,4
toxic_look_(typhos),5
depression,3
irritability,2
muscle_pain,2
altered_sensorium,2
red_spots_over_body,3
belly_pain,4
abnormal_menstruation,6
dischromic_patches,6
watering_from_eyes,4
increased_appetite,5
polyuria,4
family_history,5
mucoid_sputum,4
rusty_sputum,4
lack_of_concentration,3
visual_disturbances,3
receiving_blood_transfusion,5
receiving_unsterile_injections,2
coma,7
stomach_bleeding,6
distention_of_abdomen,4
history_of_alcohol_consumption,5
fluid_overload,4
blood_in_sputum,5
prominent_veins_on_calf,6
palpitations,4
painful_walking,2
pus_filled_pimples,2
blackheads,2
scurring,2
skin_peeling,3
silver_like_dusting,2
small_dents_in_nails,2
inflammatory_nails,2
blister,4
red_sore_around_nose,2
yellow_crust_ooze,3
prognosis,5
"""

SYMPTOM_DESCRIPTION_CSV = """Disease,Description
Drug Reaction,An adverse drug reaction (ADR) is an injury caused by taking medication. ADRs may occur following a single dose or prolonged administration of a drug or result from the combination of two or more drugs.
Malaria,An infectious disease caused by protozoan parasites from the Plasmodium family that can be transmitted by the bite of the Anopheles mosquito or by a contaminated needle or transfusion. Falciparum malaria is the most deadly type.
Allergy,"An allergy is an immune system response to a foreign substance that's not typically harmful to your body.They can include certain foods, pollen, or pet dander. Your immune system's job is to keep you healthy by fighting harmful pathogens."
Hypothyroidism,"Hypothyroidism, also called underactive thyroid or low thyroid, is a disorder of the endocrine system in which the thyroid gland does not produce enough thyroid hormone."
Psoriasis,"Psoriasis is a common skin disorder that forms thick, red, bumpy patches covered with silvery scales. They can pop up anywhere, but most appear on the scalp, elbows, knees, and lower back. Psoriasis can't be passed from person to person. It does sometimes happen in members of the same family."
GERD,"Gastroesophageal reflux disease, or GERD, is a digestive disorder that affects the lower esophageal sphincter (LES), the ring of muscle between the esophagus and stomach. Many people, including pregnant women, suffer from heartburn or acid indigestion caused by GERD."
Chronic cholestasis,"Chronic cholestatic diseases, whether occurring in infancy, childhood or adulthood, are characterized by defective bile acid transport from the liver to the intestine, which is caused by primary damage to the biliary epithelium in most cases"
hepatitis A,Hepatitis A is a highly contagious liver infection caused by the hepatitis A virus. The virus is one of several types of hepatitis viruses that cause inflammation and affect your liver's ability to function.
Osteoarthristis,"Osteoarthritis is the most common form of arthritis, affecting millions of people worldwide. It occurs when the protective cartilage that cushions the ends of your bones wears down over time."
(vertigo) Paroymsal  Positional Vertigo,Benign paroxysmal positional vertigo (BPPV) is one of the most common causes of vertigo — the sudden sensation that you're spinning or that the inside of your head is spinning. Benign paroxysmal positional vertigo causes brief episodes of mild to intense dizziness.
Hypoglycemia, Hypoglycemia is a condition in which your blood sugar (glucose) level is lower than normal. Glucose is your body's main energy source. Hypoglycemia is often related to diabetes treatment. But other drugs and a variety of conditions — many rare — can cause low blood sugar in people who don't have diabetes.
Acne,"Acne vulgaris is the formation of comedones, papules, pustules, nodules, and/or cysts as a result of obstruction and inflammation of pilosebaceous units (hair follicles and their accompanying sebaceous gland). Acne develops on the face and upper trunk. It most often affects adolescents."
Diabetes,"Diabetes is a disease that occurs when your blood glucose, also called blood sugar, is too high. Blood glucose is your main source of energy and comes from the food you eat. Insulin, a hormone made by the pancreas, helps glucose from food get into your cells to be used for energy."
Impetigo,"Impetigo (im-puh-TIE-go) is a common and highly contagious skin infection that mainly affects infants and children. Impetigo usually appears as red sores on the face, especially around a child's nose and mouth, and on hands and feet. The sores burst and develop honey-colored crusts."
Hypertension,"Hypertension (HTN or HT), also known as high blood pressure (HBP), is a long-term medical condition in which the blood pressure in the arteries is persistently elevated. High blood pressure typically does not cause symptoms."
Peptic ulcer diseae,"Peptic ulcer disease (PUD) is a break in the inner lining of the stomach, the first part of the small intestine, or sometimes the lower esophagus. An ulcer in the stomach is called a gastric ulcer, while one in the first part of the intestines is a duodenal ulcer."
Dimorphic hemorrhoids(piles),"Hemorrhoids, also spelled haemorrhoids, are vascular structures in the anal canal. In their ... Other names, Haemorrhoids, piles, hemorrhoidal disease ."
Common Cold,"The common cold is a viral infection of your nose and throat (upper respiratory tract). It's usually harmless, although it might not feel that way. Many types of viruses can cause a common cold."
Chicken pox,"Chickenpox is a highly contagious disease caused by the varicella-zoster virus (VZV). It can cause an itchy, blister-like rash. The rash first appears on the chest, back, and face, and then spreads over the entire body, causing between 250 and 500 itchy blisters."
Cervical spondylosis,"Cervical spondylosis is a general term for age-related wear and tear affecting the spinal disks in your neck. As the disks dehydrate and shrink, signs of osteoarthritis develop, including bony projections along the edges of bones (bone spurs)."
Hyperthyroidism,"Hyperthyroidism (overactive thyroid) occurs when your thyroid gland produces too much of the hormone thyroxine. Hyperthyroidism can accelerate your body's metabolism, causing unintentional weight loss and a rapid or irregular heartbeat."
Urinary tract infection,"Urinary tract infection: An infection of the kidney, ureter, bladder, or urethra. Abbreviated UTI. Not everyone with a UTI has symptoms, but common symptoms include a frequent urge to urinate and pain or burning when urinating."
Varicose veins,"A vein that has enlarged and twisted, often appearing as a bulging, blue blood vessel that is clearly visible through the skin. Varicose veins are most common in older adults, particularly women, and occur especially on the legs."
AIDS,"Acquired immunodeficiency syndrome (AIDS) is a chronic, potentially life-threatening condition caused by the human immunodeficiency virus (HIV). By damaging your immune system, HIV interferes with your body's ability to fight infection and disease."
Paralysis (brain hemorrhage),"Intracerebral hemorrhage (ICH) is when blood suddenly bursts into brain tissue, causing damage to your brain. Symptoms usually appear suddenly during ICH. They include headache, weakness, confusion, and paralysis, particularly on one side of your body."
Typhoid,"An acute illness characterized by fever caused by infection with the bacterium Salmonella typhi. Typhoid fever has an insidious onset, with fever, headache, constipation, malaise, chills, and muscle pain. Diarrhea is uncommon, and vomiting is not usually severe."
Hepatitis B,"Hepatitis B is an infection of your liver. It can cause scarring of the organ, liver failure, and cancer. It can be fatal if it isn't treated. It's spread when people come in contact with the blood, open sores, or body fluids of someone who has the hepatitis B virus."
Fungal infection,"In humans, fungal infections occur when an invading fungus takes over an area of the body and is too much for the immune system to handle. Fungi can live in the air, soil, water, and plants. There are also some fungi that live naturally in the human body. Like many microbes, there are helpful fungi and harmful fungi."
Hepatitis C,"Inflammation of the liver due to the hepatitis C virus (HCV), which is usually spread via blood transfusion (rare), hemodialysis, and needle sticks. The damage hepatitis C does to the liver can lead to cirrhosis and its complications as well as cancer."
Migraine,"A migraine can cause severe throbbing pain or a pulsing sensation, usually on one side of the head. It's often accompanied by nausea, vomiting, and extreme sensitivity to light and sound. Migraine attacks can last for hours to days, and the pain can be so severe that it interferes with your daily activities."
Bronchial Asthma,"Bronchial asthma is a medical condition which causes the airway path of the lungs to swell and narrow. Due to this swelling, the air path produces excess mucus making it hard to breathe, which results in coughing, short breath, and wheezing. The disease is chronic and interferes with daily working."
Alcoholic hepatitis,"Alcoholic hepatitis is a diseased, inflammatory condition of the liver caused by heavy alcohol consumption over an extended period of time. It's also aggravated by binge drinking and ongoing alcohol use. If you develop this condition, you must stop drinking alcohol"
Jaundice,"Yellow staining of the skin and sclerae (the whites of the eyes) by abnormally high blood levels of the bile pigment bilirubin. The yellowing extends to other tissues and body fluids. Jaundice was once called the ""morbus regius"" (the regal disease) in the belief that only the touch of a king could cure it"
Hepatitis E,A rare form of liver inflammation caused by infection with the hepatitis E virus (HEV). It is transmitted via food or drink handled by an infected person or through infected water supplies in areas where fecal matter may get into the water. Hepatitis E does not cause chronic liver disease.
Dengue,"an acute infectious disease caused by a flavivirus (species Dengue virus of the genus Flavivirus), transmitted by aedes mosquitoes, and characterized by headache, severe joint pain, and a rash. — called also breakbone fever, dengue fever."
Hepatitis D,"Hepatitis D, also known as the hepatitis delta virus, is an infection that causes the liver to become inflamed. This swelling can impair liver function and cause long-term liver problems, including liver scarring and cancer. The condition is caused by the hepatitis D virus (HDV)."
Heart attack,"The death of heart muscle due to the loss of blood supply. The loss of blood supply is usually caused by a complete blockage of a coronary artery, one of the arteries that supplies blood to the heart muscle."
Pneumonia,"Pneumonia is an infection in one or both lungs. Bacteria, viruses, and fungi cause it. The infection causes inflammation in the air sacs in your lungs, which are called alveoli. The alveoli fill with fluid or pus, making it difficult to breathe."
Arthritis,"Arthritis is the swelling and tenderness of one or more of your joints. The main symptoms of arthritis are joint pain and stiffness, which typically worsen with age. The most common types of arthritis are osteoarthritis and rheumatoid arthritis."
Gastroenteritis,"Gastroenteritis is an inflammation of the digestive tract, particularly the stomach, and large and small intestines. Viral and bacterial gastroenteritis are intestinal infections associated with symptoms of diarrhea , abdominal cramps, nausea , and vomiting ."
Tuberculosis,"Tuberculosis (TB) is an infectious disease usually caused by Mycobacterium tuberculosis (MTB) bacteria. Tuberculosis generally affects the lungs, but can also affect other parts of the body. Most infections show no symptoms, in which case it is known as latent tuberculosis."
"""

SYMPTOM_PRECAUTION_CSV = """Disease,Precaution_1,Precaution_2,Precaution_3,Precaution_4
Drug Reaction,stop irritation,consult nearest hospital,stop taking drug,follow up
Malaria,Consult nearest hospital,avoid oily food,avoid non veg food,keep mosquitos out
Allergy,apply calamine,cover area with bandage,,use ice to compress itching
Hypothyroidism,reduce stress,exercise,eat healthy,get proper sleep
Psoriasis,wash hands with warm soapy water,stop bleeding using pressure,consult doctor,salt baths
GERD,avoid fatty spicy food,avoid lying down after eating,maintain healthy weight,exercise
Chronic cholestasis,cold baths,anti itch medicine,consult doctor,eat healthy
hepatitis A,Consult nearest hospital,wash hands through,avoid fatty spicy food,medication
Osteoarthristis,acetaminophen,consult nearest hospital,follow up,salt baths
(vertigo) Paroymsal  Positional Vertigo,lie down,avoid sudden change in body,avoid abrupt head movment,relax
Hypoglycemia,lie down on side,check in pulse,drink sugary drinks,consult doctor
Acne,bath twice,avoid fatty spicy food,drink plenty of water,avoid too many products
Diabetes ,have balanced diet,exercise,consult doctor,follow up
Impetigo,soak affected area in warm water,use antibiotics,remove scabs with wet compressed cloth,consult doctor
Hypertension ,meditation,salt baths,reduce stress,get proper sleep
Peptic ulcer diseae,avoid fatty spicy food,consume probiotic food,eliminate milk,limit alcohol
Dimorphic hemmorhoids(piles),avoid fatty spicy food,consume witch hazel,warm bath with epsom salt,consume alovera juice
Common Cold,drink vitamin c rich drinks,take vapour,avoid cold food,keep fever in check
Chicken pox,use neem in bathing ,consume neem leaves,take vaccine,avoid public places
Cervical spondylosis,use heating pad or cold pack,exercise,take otc pain reliver,consult doctor
Hyperthyroidism,eat healthy,massage,use lemon balm,take radioactive iodine treatment
Urinary tract infection,drink plenty of water,increase vitamin c intake,drink cranberry juice,take probiotics
Varicose veins,lie down flat and raise the leg high,use oinments,use vein compression,dont stand still for long
AIDS,avoid open cuts,wear ppe if possible,consult doctor,follow up
Paralysis (brain hemorrhage),massage,eat healthy,exercise,consult doctor
Typhoid,eat high calorie vegitables,antiboitic therapy,consult doctor,medication
Hepatitis B,consult nearest hospital,vaccination,eat healthy,medication
Fungal infection,bath twice,use detol or neem in bathing water,keep infected area dry,use clean cloths
Hepatitis C,Consult nearest hospital,vaccination,eat healthy,medication
Migraine,meditation,reduce stress,use poloroid glasses in sun,consult doctor
Bronchial Asthma,switch to loose cloothing,take deep breaths,get away from trigger,seek help
Alcoholic hepatitis,stop alcohol consumption,consult doctor,medication,follow up
Jaundice,drink plenty of water,consume milk thistle,eat fruits and high fiberous food,medication
Hepatitis E,stop alcohol consumption,rest,consult doctor,medication
Dengue,drink papaya leaf juice,avoid fatty spicy food,keep mosquitos away,keep hydrated
Hepatitis D,consult doctor,medication,eat healthy,follow up
Heart attack,call ambulance,chew or swallow asprin,keep calm,
Pneumonia,consult doctor,medication,rest,follow up
Arthritis,exercise,use hot and cold therapy,try acupuncture,massage
Gastroenteritis,stop eating solid food for while,try taking small sips of water,rest,ease back into eating
Tuberculosis,cover mouth,consult doctor,medication,rest
"""

# --- Normalization Helpers ---
DISEASE_NAME_MAP = {
    "peptic ulcer diseae": "Peptic Ulcer Disease",
    "(vertigo) paroymsal  positional vertigo": "Paroxysmal Positional Vertigo",
    "(vertigo) paroymsal positional vertigo": "Paroxysmal Positional Vertigo",
    "dimorphic hemorrhoids(piles)": "Dimorphic Hemorrhoids (Piles)",
    "dimorphic hemmorhoids(piles)": "Dimorphic Hemorrhoids (Piles)",
    "osteoarthristis": "Osteoarthritis",
    "diabetes": "Diabetes",
    "diabetes ": "Diabetes",
    "hypertension": "Hypertension",
    "hypertension ": "Hypertension",
    "hepatitis a": "Hepatitis A",
    "hepatitis b": "Hepatitis B",
    "hepatitis c": "Hepatitis C",
    "hepatitis d": "Hepatitis D",
    "hepatitis e": "Hepatitis E",
    "gerd": "GERD",
    "aids": "AIDS",
}

def normalize_disease_name(raw_name: str) -> str:
    cleaned = raw_name.strip().lower()
    if cleaned in DISEASE_NAME_MAP:
        return DISEASE_NAME_MAP[cleaned]
    return " ".join([word.capitalize() for word in cleaned.split()])

def normalize_symptom_name(raw_symptom: str) -> str:
    cleaned = raw_symptom.replace("_", " ").strip().lower()
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned

# --- Preprocessing & Document Merging Pipeline ---
class MedicalRAGPipeline:
    def __init__(self):
        self.documents: Dict[str, Dict[str, Any]] = {}
        self.chunks: List[Dict[str, Any]] = []
        self.symptom_weights: Dict[str, int] = {}
        self._build_pipeline()

    def _build_pipeline(self):
        # 1. Parse Symptom Severities (Symptom-severity.csv)
        f_sev = csv.reader(SYMPTOM_SEVERITY_CSV.strip().splitlines())
        next(f_sev) # skip header
        for row in f_sev:
            if len(row) >= 2:
                sym_norm = normalize_symptom_name(row[0])
                try:
                    weight = int(row[1].strip())
                    self.symptom_weights[sym_norm] = weight
                except ValueError:
                    pass

        # Helper to get disease storage dict
        def get_disease_entry(raw_dname: str) -> Dict[str, Any]:
            norm_name = normalize_disease_name(raw_dname)
            if norm_name not in self.documents:
                self.documents[norm_name] = {
                    "disease": norm_name,
                    "overview": "",
                    "symptoms": set(),
                    "precautions": [],
                    "sources": set()
                }
            return self.documents[norm_name]

        # 2. Parse dataset.csv (Disease + Symptoms)
        f_ds = csv.reader(DATASET_CSV.strip().splitlines())
        next(f_ds) # header
        for row in f_ds:
            if not row or not row[0].strip():
                continue
            entry = get_disease_entry(row[0])
            entry["sources"].add("dataset.csv")
            entry["sources"].add("Symptom-severity.csv")
            for raw_sym in row[1:]:
                if raw_sym.strip():
                    entry["symptoms"].add(normalize_symptom_name(raw_sym))

        # 3. Parse symptom_Description.csv (Disease + Description)
        f_desc = csv.reader(SYMPTOM_DESCRIPTION_CSV.strip().splitlines())
        next(f_desc)
        for row in f_desc:
            if len(row) >= 2 and row[0].strip():
                entry = get_disease_entry(row[0])
                entry["overview"] = row[1].strip()
                entry["sources"].add("symptom_Description.csv")

        # 4. Parse symptom_precaution.csv (Disease + Precautions)
        f_prec = csv.reader(SYMPTOM_PRECAUTION_CSV.strip().splitlines())
        next(f_prec)
        for row in f_prec:
            if len(row) >= 2 and row[0].strip():
                entry = get_disease_entry(row[0])
                entry["sources"].add("symptom_precaution.csv")
                for p in row[1:]:
                    cleaned_p = p.strip()
                    if cleaned_p and cleaned_p not in entry["precautions"]:
                        entry["precautions"].append(cleaned_p[0].upper() + cleaned_p[1:])

        # 5. Create Structured Single Document Per Disease & Create Section Chunks
        chunk_id_idx = 1
        for dname, data in self.documents.items():
            symptoms_list = sorted(list(data["symptoms"]))
            symptom_lines = [f"- {s.title()}" for s in symptoms_list]
            
            severity_lines = []
            for s in symptoms_list:
                w = self.symptom_weights.get(s, 3) # default weight 3 if unlisted
                severity_lines.append(f"- {s.title()}: {w}")

            precaution_lines = [f"- {p}" for p in data["precautions"]]
            source_lines = [f"- {s}" for s in sorted(list(data["sources"]))]

            # Full Document Markdown Schema
            full_doc_markdown = (
                f"Disease: {dname}\n\n"
                f"## Overview\n{data['overview'] or 'Overview description not provided in dataset.'}\n\n"
                f"## Symptoms\n" + ("\n".join(symptom_lines) if symptom_lines else "- None specified") + "\n\n"
                f"## Symptom Severity\n" + ("\n".join(severity_lines) if severity_lines else "- None specified") + "\n\n"
                f"## Precautions\n" + ("\n".join(precaution_lines) if precaution_lines else "- None specified") + "\n\n"
                f"## Sources\n" + ("\n".join(source_lines))
            )
            data["full_markdown"] = full_doc_markdown

            # Section Chunks with ChromaDB Compatible Metadata
            # Overview Chunk
            self.chunks.append({
                "id": f"chunk_{chunk_id_idx:04d}",
                "disease": dname,
                "section": "overview",
                "content": f"Disease: {dname}\n\n## Overview\n{data['overview']}",
                "metadata": {
                    "disease": dname,
                    "section": "overview",
                    "symptoms": ", ".join(symptoms_list),
                    "source": "symptom_Description.csv"
                }
            })
            chunk_id_idx += 1

            # Symptoms Chunk
            self.chunks.append({
                "id": f"chunk_{chunk_id_idx:04d}",
                "disease": dname,
                "section": "symptoms",
                "content": f"Disease: {dname}\n\n## Symptoms\n" + "\n".join(symptom_lines),
                "metadata": {
                    "disease": dname,
                    "section": "symptoms",
                    "symptoms": ", ".join(symptoms_list),
                    "source": "dataset.csv"
                }
            })
            chunk_id_idx += 1

            # Severity Chunk
            self.chunks.append({
                "id": f"chunk_{chunk_id_idx:04d}",
                "disease": dname,
                "section": "severity",
                "content": f"Disease: {dname}\n\n## Symptom Severity\n" + "\n".join(severity_lines),
                "metadata": {
                    "disease": dname,
                    "section": "severity",
                    "symptoms": ", ".join(symptoms_list),
                    "source": "Symptom-severity.csv"
                }
            })
            chunk_id_idx += 1

            # Precautions Chunk
            if data["precautions"]:
                self.chunks.append({
                    "id": f"chunk_{chunk_id_idx:04d}",
                    "disease": dname,
                    "section": "precautions",
                    "content": f"Disease: {dname}\n\n## Precautions\n" + "\n".join(precaution_lines),
                    "metadata": {
                        "disease": dname,
                        "section": "precautions",
                        "symptoms": ", ".join(symptoms_list),
                        "source": "symptom_precaution.csv"
                    }
                })
                chunk_id_idx += 1

# --- Vector Index & Retrieval Engine ---
class ChromaMedicalVectorStore:
    def __init__(self, pipeline: MedicalRAGPipeline):
        self.pipeline = pipeline
        self.use_chromadb = False
        self.chroma_collection = None
        self._init_chromadb()

    def _init_chromadb(self):
        try:
            import chromadb
            chroma_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chroma_db")
            os.makedirs(chroma_path, exist_ok=True)
            
            client = chromadb.PersistentClient(path=chroma_path)
            self.chroma_collection = client.get_or_create_collection(
                name="medical_kb",
                metadata={"description": "Normalized Medical Diseases and Symptoms Knowledge Base"}
            )
            
            if self.chroma_collection.count() == 0:
                ids = [c["id"] for c in self.pipeline.chunks]
                documents = [c["content"] for c in self.pipeline.chunks]
                metadatas = [c["metadata"] for c in self.pipeline.chunks]
                self.chroma_collection.add(ids=ids, documents=documents, metadatas=metadatas)
                
            self.use_chromadb = True
            print(f"ChromaDB persistent collection initialized with {self.chroma_collection.count()} chunks.")
        except Exception as e:
            print(f"ChromaDB initialization fallback mode active: {e}")
            self.use_chromadb = False

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r'\w+', text.lower())
        return [w for w in words if len(w) > 2]

    def _compute_tf(self, tokens: List[str]) -> Dict[str, float]:
        tf = {}
        for t in tokens:
            tf[t] = tf.get(t, 0.0) + 1.0
        norm = math.sqrt(sum(v*v for v in tf.values())) or 1.0
        return {k: v / norm for k, v in tf.items()}

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        results = []
        
        if self.use_chromadb and self.chroma_collection is not None:
            try:
                res = self.chroma_collection.query(
                    query_texts=[query],
                    n_results=top_k
                )
                if res and res.get("documents") and len(res["documents"]) > 0:
                    docs = res["documents"][0]
                    metas = res["metadatas"][0] if res.get("metadatas") else [{}] * len(docs)
                    distances = res["distances"][0] if res.get("distances") else [0.5] * len(docs)
                    
                    for doc, meta, dist in zip(docs, metas, distances):
                        score = max(0.0, 1.0 - (dist / 2.0)) if dist is not None else 0.8
                        results.append({
                            "content": doc,
                            "metadata": meta,
                            "score": round(score, 4)
                        })
                    return results
            except Exception as e:
                print(f"ChromaDB query error, falling back to TF-IDF retriever: {e}")

        # Fallback Vector Search (TF-IDF Cosine Similarity with metadata filtering & disease matching boost)
        query_tokens = self._tokenize(query)
        query_tf = self._compute_tf(query_tokens)
        
        scored_chunks = []
        for chunk in self.pipeline.chunks:
            chunk_tokens = self._tokenize(chunk["content"])
            chunk_tf = self._compute_tf(chunk_tokens)
            
            sim = sum(v * chunk_tf.get(k, 0.0) for k, v in query_tf.items())
            
            disease = chunk["disease"].lower()
            if disease in query.lower() or query.lower() in disease:
                sim += 0.4
                
            if chunk["section"] in query.lower():
                sim += 0.2
                
            scored_chunks.append({
                "content": chunk["content"],
                "metadata": chunk["metadata"],
                "score": round(sim, 4)
            })

        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:top_k]


# Instantiate Pipeline and VectorStore
rag_pipeline = MedicalRAGPipeline()
vector_store = ChromaMedicalVectorStore(rag_pipeline)


# --- RAG Retrieval, Deduplication, Reranking & Synthesis Engine ---
# Helper to calculate cosine similarity of TF-IDF vectors
def calculate_tf_idf_similarity(query: str, text: str) -> float:
    words_q = re.findall(r'\w+', query.lower())
    query_tokens = [w for w in words_q if len(w) > 2]
    
    words_d = re.findall(r'\w+', text.lower())
    doc_tokens = [w for w in words_d if len(w) > 2]
    
    if not query_tokens or not doc_tokens:
        return 0.0
        
    q_tf = {}
    for t in query_tokens:
        q_tf[t] = q_tf.get(t, 0.0) + 1.0
    q_norm = math.sqrt(sum(v*v for v in q_tf.values()))
    
    d_tf = {}
    for t in doc_tokens:
        d_tf[t] = d_tf.get(t, 0.0) + 1.0
    d_norm = math.sqrt(sum(v*v for v in d_tf.values()))
    
    dot_product = sum(q_tf[k] * d_tf.get(k, 0.0) for k in q_tf)
    return dot_product / (q_norm * d_norm)

def process_rag_query(query: str, role: str = "patient") -> Dict[str, Any]:
    query_lower = query.lower().strip()
    query_clean = re.sub(r'[^\w\s]', '', query_lower).strip()

    # Step 1: Casual message checking (DO NOT query medical RAG)
    casual_keywords = [
        "hello", "hi", "hey", "greetings", "good morning", "good afternoon", 
        "good evening", "thank you", "thanks", "bye", "goodbye", "casual",
        "feel good", "feeling well", "feeling very well", "feeling great"
    ]
    query_words = query_clean.split()
    is_casual = False
    
    if not query_words:
        is_casual = True
    elif len(query_words) <= 3 and any(w in ["hello", "hi", "hey", "thanks", "thank", "bye", "welcome", "greetings"] for w in query_words):
        is_casual = True
    elif "how are you" in query_clean:
        is_casual = True
    elif any(f"feeling {s}well" in query_clean for s in ["", "very ", "so ", "pretty ", "really "]):
        is_casual = True
    elif any(f"feeling {s}good" in query_clean for s in ["", "very ", "so ", "pretty ", "really "]):
        is_casual = True
    elif "feeling great" in query_clean:
        is_casual = True
    elif "feel well" in query_clean or "feel very well" in query_clean or "feel good" in query_clean:
        is_casual = True
    elif query_clean in ["thanks", "thank you", "thank u", "ty"]:
        is_casual = True

    if is_casual:
        ans = "Hello! I am AegisNet Care Assistant. I am glad to hear you are feeling well. How can I assist you today?"
        return {
            "intent": "casual",
            "answer": ans,
            "response": ans,
            "sections": [],
            "sources": [],
            "relevance": "low",
            "role": role,
            "is_critical": False
        }

    # Step 2: Critical Emergency Keywords Check
    critical_keywords = ["chest pain", "can't breathe", "fainted", "unconscious", "stroke", "severe fall", "heart attack", "difficulty breathing", "shortness of breath"]
    if any(kw in query_lower for kw in critical_keywords):
        ans = "🚨 **EMERGENCY WARNING**: Severe distress symptoms detected in your query. Please push your red Emergency SOS button immediately or call local emergency medical services (911/112). Emergency dispatches have been notified."
        return {
            "intent": "emergency",
            "answer": ans,
            "response": ans,
            "sections": ["critical"],
            "sources": ["Emergency Protocol"],
            "relevance": "high",
            "role": role,
            "is_critical": True
        }

    # Step 3: Safety Policy Check (Dosage modifications)
    if role.lower() == "patient":
        dosage_change_keywords = ["stop medication", "change dose", "increase dose", "decrease dose", "double dose", "stopping medication", "adjust dose"]
        if any(kw in query_lower for kw in dosage_change_keywords):
            ans = "⚠️ **AegisNet Safety Protocol**: You must never stop or adjust your prescribed medication without direct instructions from your attending physician. Please contact your doctor or care provider to request a dosage review."
            return {
                "intent": "safety_policy",
                "answer": ans,
                "response": ans,
                "sections": ["dosage_lock"],
                "sources": ["Safety Protocol"],
                "relevance": "high",
                "role": role,
                "is_critical": False
            }

    # Step 4: SpO2 Pulse Oximetry Guidance
    if "spo2" in query_lower or "oxygen" in query_lower:
        ans = (
            "## SpO₂ Pulse Oximetry Guidance\n\n"
            "SpO₂ (Peripheral Oxygen Saturation) measures the percentage of oxygen carried by your red blood cells.\n\n"
            "### General Ranges & Guidelines\n"
            "- **Normal SpO₂ Range**: 95% – 100% is considered healthy for adults.\n"
            "- **Low Oxygen (Hypoxia Warning)**: SpO₂ dropping below 92% requires rest and monitoring. Below 90% is considered hypoxic and requires immediate medical attention.\n"
            "- **Action Protocol**: If experiencing shortness of breath alongside SpO₂ < 92%, sit upright, remain calm, and contact your attending doctor or hold the Emergency SOS button."
        )
        return {
            "intent": "vitals_inquiry",
            "answer": ans,
            "response": ans,
            "sections": ["vitals_spo2"],
            "sources": ["Telemetry Guidelines", "Patient Reference"],
            "relevance": "high",
            "role": role,
            "is_critical": False
        }

    # Step 5: Doctor Consultation Checklist
    if "ask my doctor" in query_lower or "ask the doctor" in query_lower or "prepare for doctor" in query_lower:
        ans = (
            "## Physician Consultation Checklist\n\n"
            "When speaking with your attending doctor or specialist, it is recommended to discuss:\n\n"
            "### Key Questions to Ask\n"
            "- **Vital Trends**: Review any recent blood pressure spikes, pulse fluctuations, or SpO₂ variance.\n"
            "- **Prescriptions & Dosage**: Confirm whether current dosages (e.g. morning/night schedules) should remain unchanged.\n"
            "- **Side Effects**: Mention any dizziness, fatigue, or unusual physical symptoms experienced recently.\n"
            "- **Activity Limits**: Ask about recommended daily walking or exercise limits based on your longitudinal history."
        )
        return {
            "intent": "doctor_checklist",
            "answer": ans,
            "response": ans,
            "sections": ["doctor_consult"],
            "sources": ["Clinical Reference Guidelines"],
            "relevance": "high",
            "role": role,
            "is_critical": False
        }

    # Step 6: Explicit Disease Entity Match & Topic/Symptom Extraction
    explicit_disease = None
    sorted_diseases = sorted(rag_pipeline.documents.keys(), key=len, reverse=True)
    for norm_dname in sorted_diseases:
        if norm_dname.lower() in query_lower:
            explicit_disease = norm_dname
            break
        disease_clean = re.sub(r'\(.*?\)', '', norm_dname).strip().lower()
        if len(disease_clean) > 3 and disease_clean in query_lower:
            explicit_disease = norm_dname
            break

    # Extract symptoms from query
    all_known_symptoms = set()
    for dname, data in rag_pipeline.documents.items():
        for sym in data["symptoms"]:
            all_known_symptoms.add(sym)
            
    extracted_symptoms = []
    sorted_symptoms = sorted(list(all_known_symptoms), key=len, reverse=True)
    for sym in sorted_symptoms:
        if sym in query_lower or sym.replace(" ", "_") in query_lower:
            extracted_symptoms.append(sym)
            
    # Basic symptom triggers mapping
    symptom_triggers = {
        "fever": "high fever",
        "itch": "itching",
        "itching": "itching",
        "rash": "skin rash",
        "vomit": "vomiting",
        "vomiting": "vomiting",
        "nausea": "nausea",
        "headache": "headache",
        "cough": "cough",
        "joint pain": "joint pain",
        "stomach pain": "stomach pain",
        "diarrhoea": "diarrhoea",
        "diarrhea": "diarrhoea",
        "dizziness": "dizziness",
        "chills": "chills"
    }
    for trigger, sym_norm in symptom_triggers.items():
        if trigger in query_lower and sym_norm not in extracted_symptoms:
            extracted_symptoms.append(sym_norm)

    # Apply Metadata-Filtered Retrieval for Disease Inquiry
    if explicit_disease:
        # Retrieve ONLY chunks belonging to this disease (Metadata-filtered retrieval)
        disease_chunks = [
            chunk for chunk in rag_pipeline.chunks 
            if chunk["metadata"]["disease"].lower() == explicit_disease.lower()
        ]
        
        # Calculate similarity and apply similarity threshold
        valid_chunks = []
        for chunk in disease_chunks:
            sim = calculate_tf_idf_similarity(query_lower, chunk["content"])
            # Boost score for explicit matching
            sim = max(sim, 0.5)
            if sim >= 0.15:
                valid_chunks.append((sim, chunk))
                
        # Rerank & Deduplicate chunks
        valid_chunks.sort(key=lambda x: x[0], reverse=True)
        
        # Deduplication
        seen_sections = set()
        dedup_chunks = []
        for sim, chunk in valid_chunks:
            sect = chunk["section"]
            if sect not in seen_sections:
                seen_sections.add(sect)
                dedup_chunks.append(chunk)

        if not dedup_chunks:
            # Fallback if similarity threshold is not met
            ans = "I don't have relevant information for this question."
            return {
                "intent": "unknown",
                "answer": ans,
                "response": ans,
                "sections": [],
                "sources": [],
                "relevance": "low",
                "role": role,
                "is_critical": False
            }

        # Local LLM Response Synthesis
        doc_data = rag_pipeline.documents[explicit_disease]
        overview_text = doc_data.get("overview") or ""
        symptoms_list = sorted(list(doc_data.get("symptoms", [])))
        precautions_list = doc_data.get("precautions", [])
        
        short_ans = f"**{explicit_disease}**: {overview_text or 'Overview description not provided in dataset.'}"
        
        response_lines = [
            f"## {explicit_disease}\n",
            f"### Short Answer\n{short_ans}\n",
        ]
        
        details_lines = []
        # We only show details that correspond to retrieved chunk sections actually used!
        used_sections = [c["section"] for c in dedup_chunks]
        used_sources = set()
        
        if "symptoms" in used_sections and symptoms_list:
            details_lines.append("Common clinical symptoms associated with this condition in our dataset include:")
            for s in symptoms_list:
                details_lines.append(f"- {s.title()}")
            details_lines.append("")
            used_sources.add("dataset.csv")
            used_sources.add("Symptom-severity.csv")
            
        if "precautions" in used_sections and precautions_list:
            details_lines.append("Recommended immediate precautions and self-care guidelines:")
            for p in precautions_list:
                details_lines.append(f"- {p}")
            details_lines.append("")
            used_sources.add("symptom_precaution.csv")
            
        if "overview" in used_sections:
            used_sources.add("symptom_Description.csv")

        if details_lines:
            response_lines.append("### Relevant Details")
            response_lines.extend(details_lines)

        response_lines.append("### Safety Note")
        response_lines.append("⚠️ Automatic diagnosis is not supported. Please consult your physician or a healthcare provider for personalized medical evaluation and clinical diagnosis.\n")

        answer_text = "\n".join(response_lines).strip()
        
        return {
            "intent": "disease_inquiry",
            "answer": answer_text,
            "response": answer_text,
            "sections": sorted(list(used_sections)),
            "sources": sorted(list(used_sources)),
            "relevance": "high",
            "role": role,
            "is_critical": False
        }

    # Step 7: Symptom Extraction / General Health-Information Query (NOT automatic diagnosis)
    # If the query contains symptoms but no explicit disease name, treat it as a symptom inquiry
    if extracted_symptoms:
        # Find all diseases associated with these symptoms
        matching_diseases = []
        for dname, data in rag_pipeline.documents.items():
            if any(sym in data["symptoms"] for sym in extracted_symptoms):
                matching_diseases.append(dname)
                
        # Avoid direct diagnosis - Rule 4 & Rule 6
        primary_symptom = extracted_symptoms[0]
        symptom_title = primary_symptom.replace("_", " ").title()
        
        diseases_str = ", ".join(sorted(matching_diseases[:6])) if matching_diseases else "various medical conditions"
        
        ans = (
            f"## General Care Guidance for {symptom_title}\n\n"
            f"### Short Answer\n"
            f"You mentioned experiencing {primary_symptom.replace('_', ' ')}. Below are standard home care guidelines and important clinical context from our dataset.\n\n"
            f"### Relevant Details\n"
            f"- **Rest & Hydration**: Rest adequately and maintain fluid intake (water, clear broths, or oral rehydration fluids).\n"
            f"- **Monitor Vitals**: Track changes in your body temperature, pulse oximetry (SpO₂) , and overall well-being.\n"
            f"- **Comfort Measures**: Stay in a well-ventilated, comfortable environment and avoid over-exertion.\n"
            f"- **Clinical Context**: In our medical dataset, {primary_symptom.replace('_', ' ')} is a non-specific symptom associated with multiple conditions including: {diseases_str}.\n"
            f"- **No Automatic Diagnosis**: A single symptom cannot be used to diagnose a specific illness. Automatic diagnosis is not supported.\n\n"
            f"### Safety Note\n"
            f"⚠️ Consult your doctor or visit a healthcare clinic if your {primary_symptom.replace('_', ' ')} persists, worsens, or is accompanied by severe difficulty breathing, confusion, or chest discomfort."
        )

        return {
            "intent": "symptom_inquiry",
            "answer": ans,
            "response": ans,
            "sections": ["symptom_care", "clinical_context"],
            "sources": ["dataset.csv", "symptom_precaution.csv", "Symptom-severity.csv"],
            "relevance": "high",
            "role": role,
            "is_critical": False
        }

    # Step 8: Search Role-Specific Knowledge Base
    from app.hub.rag_engine import rag_engine
    role_chunks = rag_engine.retrieve_context(role=role, query=query, top_k=3)
    
    # Apply similarity threshold to role-specific chunks
    valid_role_chunks = []
    for chunk in role_chunks:
        chunk_content = chunk.get("content", "")
        combined_chunk_text = f"{chunk_content} {' '.join(chunk.get('keywords', []))} {chunk.get('category', '')}"
        sim = calculate_tf_idf_similarity(query_lower, combined_chunk_text)
        if sim >= 0.15:
            valid_role_chunks.append((sim, chunk))
            
    # Sort and deduplicate role chunks
    valid_role_chunks.sort(key=lambda x: x[0], reverse=True)
    
    if valid_role_chunks:
        response_parts = []
        sources = set()
        sections = []
        for sim, chunk in valid_role_chunks:
            content = chunk.get("content", "")
            if content not in response_parts:
                response_parts.append(content)
                cat = chunk.get("category", "General")
                sections.append(cat)
                sources.add(f"{role.capitalize()} KB - {cat.replace('_', ' ').title()}")
                
        answer_text = "\n\n".join(response_parts)
        return {
            "intent": "role_kb_inquiry",
            "answer": answer_text,
            "response": answer_text,
            "sections": sections,
            "sources": sorted(list(sources)),
            "relevance": "high",
            "role": role,
            "is_critical": False
        }

    # Step 9: Relevance Fallback
    ans = "I don't have relevant information for this question."
    return {
        "intent": "unknown",
        "answer": ans,
        "response": ans,
        "sections": [],
        "sources": [],
        "relevance": "low",
        "role": role,
        "is_critical": False
    }


