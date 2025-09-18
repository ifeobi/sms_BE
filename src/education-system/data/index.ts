import {
  EducationSystem,
  EducationLevel,
  ClassLevel,
  SystemSuggestion,
  SubjectDefinition,
  GradingScale,
  GradeRange,
  AcademicTerm,
  VacationPeriod,
  EducationSystemFeatures,
  EducationSystemCalendar,
} from '../interfaces/education-system.interface';


// Default features and calendar for all education systems
const defaultFeatures: EducationSystemFeatures = {
  usesTerms: true,
  hasExams: true,
  supportsElectives: true,
  maxSubjectsPerLevel: 10,
};

const defaultCalendar: EducationSystemCalendar = {
  academicYearStart: 9, // September
  academicYearEnd: 7, // July
  vacationPeriods: [
    {
      name: "Christmas Break",
      startMonth: 12,
      endMonth: 1,
      description: "End of year holiday break",
    },
    {
      name: "Easter Break",
      startMonth: 3,
      endMonth: 4,
      description: "Easter holiday break",
    },
    {
      name: "Summer Break",
      startMonth: 7,
      endMonth: 8,
      description: "Long summer vacation",
    },
  ],
};

// Nigerian Education System
const nigerianSystem: EducationSystem = {
  id: "nigeria",
  country: "Nigeria",
  countryCode: "NG",
  systemName: "Nigerian Education System",
  description:
    "6-3-3-4 system: 6 years Primary, 3 years JSS, 3 years SSS, 4 years University",
  flag: "🇳🇬",
  phoneCode: "+234",
  features: defaultFeatures,
  calendar: defaultCalendar,
  levels: [
    {
      id: "preschool",
      name: "Pre-school",
      description: "Early childhood education",
      ageRange: [2, 4],
      classLevels: [
        {
          id: "preschool1",
          name: "Pre-school 1",
          ageRange: [2, 3],
          description: "First year of pre-school",
          subjects: ["Basic Skills", "Social Development"],
        },
        {
          id: "preschool2",
          name: "Pre-school 2",
          ageRange: [3, 4],
          description: "Second year of pre-school",
          subjects: ["Basic Skills", "Social Development"],
        },
      ],
      subjects: ["Basic Skills", "Social Development"],
    },
    {
      id: "nursery",
      name: "Nursery/Pre-Primary",
      description: "Early childhood education for ages 3-5",
      ageRange: [3, 5],
      classLevels: [
        {
          id: "nursery1",
          name: "Nursery 1",
          ageRange: [3, 4],
          description: "First year of nursery",
          subjects: ["Basic Skills", "Social Development"],
        },
        {
          id: "nursery2",
          name: "Nursery 2",
          ageRange: [4, 5],
          description: "Second year of nursery",
          subjects: ["Basic Skills", "Social Development"],
        },
        {
          id: "nursery3",
          name: "Nursery 3",
          ageRange: [5, 6],
          description: "Third year of nursery",
          subjects: ["Basic Skills", "Social Development"],
        },
      ],
      subjects: ["Basic Skills", "Social Development"],
    },
    {
      id: "primary",
      name: "Primary School",
      description: "6 years of primary education",
      ageRange: [6, 11],
      classLevels: [
        {
          id: "primary1",
          name: "Primary 1",
          ageRange: [6, 7],
          description: "First year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Social Studies",
            "Basic Science",
          ],
        },
        {
          id: "primary2",
          name: "Primary 2",
          ageRange: [7, 8],
          description: "Second year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Social Studies",
            "Basic Science",
          ],
        },
        {
          id: "primary3",
          name: "Primary 3",
          ageRange: [8, 9],
          description: "Third year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Social Studies",
            "Basic Science",
          ],
        },
        {
          id: "primary4",
          name: "Primary 4",
          ageRange: [9, 10],
          description: "Fourth year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Social Studies",
            "Basic Science",
          ],
        },
        {
          id: "primary5",
          name: "Primary 5",
          ageRange: [10, 11],
          description: "Fifth year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Social Studies",
            "Basic Science",
          ],
        },
        {
          id: "primary6",
          name: "Primary 6",
          ageRange: [11, 12],
          description: "Sixth year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Social Studies",
            "Basic Science",
          ],
        },
      ],
      subjects: [
        "English",
        "Mathematics",
        "Social Studies",
        "Basic Science",
        "Religious Studies",
        "Creative Arts",
      ],
      nationalExam: "Primary School Leaving Certificate",
    },
    {
      id: "jss",
      name: "Junior Secondary School (JSS)",
      description: "3 years of junior secondary education",
      ageRange: [12, 14],
      classLevels: [
        {
          id: "jss1",
          name: "JSS 1",
          ageRange: [12, 13],
          description: "First year of JSS",
          subjects: [
            "English",
            "Mathematics",
            "Basic Science",
            "Social Studies",
          ],
        },
        {
          id: "jss2",
          name: "JSS 2",
          ageRange: [13, 14],
          description: "Second year of JSS",
          subjects: [
            "English",
            "Mathematics",
            "Basic Science",
            "Social Studies",
          ],
        },
        {
          id: "jss3",
          name: "JSS 3",
          ageRange: [14, 15],
          description: "Third year of JSS",
          subjects: [
            "English",
            "Mathematics",
            "Basic Science",
            "Social Studies",
          ],
        },
      ],
      subjects: [
        "English",
        "Mathematics",
        "Basic Science",
        "Social Studies",
        "Agricultural Science",
        "Home Economics",
        "Business Studies",
      ],
      nationalExam: "Junior Secondary School Certificate",
    },
    {
      id: "sss",
      name: "Senior Secondary School (SSS)",
      description: "3 years of senior secondary education",
      ageRange: [15, 17],
      classLevels: [
        {
          id: "sss1",
          name: "SSS 1",
          ageRange: [15, 16],
          description: "First year of SSS",
          subjects: [
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "sss2",
          name: "SSS 2",
          ageRange: [16, 17],
          description: "Second year of SSS",
          subjects: [
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "sss3",
          name: "SSS 3",
          ageRange: [17, 18],
          description: "Third year of SSS",
          subjects: [
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
      ],
      subjects: [
        "English",
        "Mathematics",
        "Biology",
        "Chemistry",
        "Physics",
        "Economics",
        "Government",
        "Literature",
        "History",
        "Geography",
      ],
      nationalExam: "Senior Secondary School Certificate (SSCE)",
    },
  ],
};

// Ghanaian Education System
const ghanaianSystem: EducationSystem = {
  id: "ghana",
  country: "Ghana",
  countryCode: "GH",
  systemName: "Ghanaian Education System",
  description:
    "2-6-3-4 system: 2 years Kindergarten, 6 years Primary, 3 years JHS, 3 years SHS, 4 years University",
  flag: "🇬🇭",
  phoneCode: "+233",
  features: defaultFeatures,
  calendar: defaultCalendar,
  levels: [
    {
      id: "kindergarten",
      name: "Kindergarten",
      description: "2 years of kindergarten education",
      ageRange: [4, 6],
      classLevels: [
        {
          id: "kg1",
          name: "KG 1",
          ageRange: [4, 5],
          description: "First year of kindergarten",
          subjects: ["Basic Skills", "Social Development"],
        },
        {
          id: "kg2",
          name: "KG 2",
          ageRange: [5, 6],
          description: "Second year of kindergarten",
          subjects: ["Basic Skills", "Social Development"],
        },
      ],
      subjects: ["Basic Skills", "Social Development"],
    },
    {
      id: "primary",
      name: "Primary School",
      description: "6 years of primary education",
      ageRange: [6, 12],
      classLevels: [
        {
          id: "primary1",
          name: "Primary 1",
          ageRange: [6, 7],
          description: "First year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Social Studies",
            "Integrated Science",
          ],
        },
        {
          id: "primary2",
          name: "Primary 2",
          ageRange: [7, 8],
          description: "Second year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Social Studies",
            "Integrated Science",
          ],
        },
        {
          id: "primary3",
          name: "Primary 3",
          ageRange: [8, 9],
          description: "Third year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Social Studies",
            "Integrated Science",
          ],
        },
        {
          id: "primary4",
          name: "Primary 4",
          ageRange: [9, 10],
          description: "Fourth year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Social Studies",
            "Integrated Science",
          ],
        },
        {
          id: "primary5",
          name: "Primary 5",
          ageRange: [10, 11],
          description: "Fifth year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Social Studies",
            "Integrated Science",
          ],
        },
        {
          id: "primary6",
          name: "Primary 6",
          ageRange: [11, 12],
          description: "Sixth year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Social Studies",
            "Integrated Science",
          ],
        },
      ],
      subjects: [
        "English",
        "Mathematics",
        "Social Studies",
        "Integrated Science",
        "Religious and Moral Education",
        "Creative Arts",
      ],
      nationalExam: "Primary School Leaving Certificate",
    },
    {
      id: "jhs",
      name: "Junior High School (JHS)",
      description: "3 years of junior high school education",
      ageRange: [12, 15],
      classLevels: [
        {
          id: "jhs1",
          name: "JHS 1",
          ageRange: [12, 13],
          description: "First year of JHS",
          subjects: [
            "English",
            "Mathematics",
            "Integrated Science",
            "Social Studies",
          ],
        },
        {
          id: "jhs2",
          name: "JHS 2",
          ageRange: [13, 14],
          description: "Second year of JHS",
          subjects: [
            "English",
            "Mathematics",
            "Integrated Science",
            "Social Studies",
          ],
        },
        {
          id: "jhs3",
          name: "JHS 3",
          ageRange: [14, 15],
          description: "Third year of JHS",
          subjects: [
            "English",
            "Mathematics",
            "Integrated Science",
            "Social Studies",
          ],
        },
      ],
      subjects: [
        "English",
        "Mathematics",
        "Integrated Science",
        "Social Studies",
        "Agricultural Science",
        "Home Economics",
        "Business Studies",
      ],
      nationalExam: "Basic Education Certificate Examination (BECE)",
    },
    {
      id: "shs",
      name: "Senior High School (SHS)",
      description: "3 years of senior high school education",
      ageRange: [15, 18],
      classLevels: [
        {
          id: "shs1",
          name: "SHS 1",
          ageRange: [15, 16],
          description: "First year of SHS",
          subjects: [
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "shs2",
          name: "SHS 2",
          ageRange: [16, 17],
          description: "Second year of SHS",
          subjects: [
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "shs3",
          name: "SHS 3",
          ageRange: [17, 18],
          description: "Third year of SHS",
          subjects: [
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
      ],
      subjects: [
        "English",
        "Mathematics",
        "Biology",
        "Chemistry",
        "Physics",
        "Economics",
        "Government",
        "Literature",
        "History",
        "Geography",
      ],
      nationalExam:
        "West African Senior School Certificate Examination (WASSCE)",
    },
  ],
};

// Kenyan Education System
const kenyanSystem: EducationSystem = {
  id: "kenya",
  country: "Kenya",
  countryCode: "KE",
  systemName: "Kenyan Education System",
  description:
    "8-4-4 system: 8 years Primary, 4 years Secondary, 4 years University",
  flag: "🇰🇪",
  phoneCode: "+254",
  features: defaultFeatures,
  calendar: defaultCalendar,
  levels: [
    {
      id: "primary",
      name: "Primary School",
      description: "8 years of primary education",
      ageRange: [6, 13],
      classLevels: [
        {
          id: "std1",
          name: "Standard 1",
          ageRange: [6, 7],
          description: "First year of primary",
          subjects: [
            "English",
            "Kiswahili",
            "Mathematics",
            "Environmental Activities",
          ],
        },
        {
          id: "std2",
          name: "Standard 2",
          ageRange: [7, 8],
          description: "Second year of primary",
          subjects: [
            "English",
            "Kiswahili",
            "Mathematics",
            "Environmental Activities",
          ],
        },
        {
          id: "std3",
          name: "Standard 3",
          ageRange: [8, 9],
          description: "Third year of primary",
          subjects: [
            "English",
            "Kiswahili",
            "Mathematics",
            "Environmental Activities",
          ],
        },
        {
          id: "std4",
          name: "Standard 4",
          ageRange: [9, 10],
          description: "Fourth year of primary",
          subjects: [
            "English",
            "Kiswahili",
            "Mathematics",
            "Environmental Activities",
          ],
        },
        {
          id: "std5",
          name: "Standard 5",
          ageRange: [10, 11],
          description: "Fifth year of primary",
          subjects: [
            "English",
            "Kiswahili",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "std6",
          name: "Standard 6",
          ageRange: [11, 12],
          description: "Sixth year of primary",
          subjects: [
            "English",
            "Kiswahili",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "std7",
          name: "Standard 7",
          ageRange: [12, 13],
          description: "Seventh year of primary",
          subjects: [
            "English",
            "Kiswahili",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "std8",
          name: "Standard 8",
          ageRange: [13, 14],
          description: "Eighth year of primary",
          subjects: [
            "English",
            "Kiswahili",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
      ],
      subjects: [
        "English",
        "Kiswahili",
        "Mathematics",
        "Science",
        "Social Studies",
        "Religious Education",
        "Creative Arts",
      ],
      nationalExam: "Kenya Certificate of Primary Education (KCPE)",
    },
    {
      id: "secondary",
      name: "Secondary School",
      description: "4 years of secondary education",
      ageRange: [14, 17],
      classLevels: [
        {
          id: "form1",
          name: "Form 1",
          ageRange: [14, 15],
          description: "First year of secondary",
          subjects: [
            "English",
            "Kiswahili",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "form2",
          name: "Form 2",
          ageRange: [15, 16],
          description: "Second year of secondary",
          subjects: [
            "English",
            "Kiswahili",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "form3",
          name: "Form 3",
          ageRange: [16, 17],
          description: "Third year of secondary",
          subjects: [
            "English",
            "Kiswahili",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "form4",
          name: "Form 4",
          ageRange: [17, 18],
          description: "Fourth year of secondary",
          subjects: [
            "English",
            "Kiswahili",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
      ],
      subjects: [
        "English",
        "Kiswahili",
        "Mathematics",
        "Biology",
        "Chemistry",
        "Physics",
        "History",
        "Geography",
        "Religious Education",
        "Business Studies",
      ],
      nationalExam: "Kenya Certificate of Secondary Education (KCSE)",
    },
  ],
};

// Ugandan Education System
const ugandanSystem: EducationSystem = {
  id: "uganda",
  country: "Uganda",
  countryCode: "UG",
  systemName: "Ugandan Education System",
  description:
    "7-4-2-3 system: 7 years Primary, 4 years O-Level, 2 years A-Level, 3+ years University",
  flag: "🇺🇬",
  phoneCode: "+256",
  features: defaultFeatures,
  calendar: defaultCalendar,
  levels: [
    {
      id: "primary",
      name: "Primary School",
      description: "7 years of primary education",
      ageRange: [6, 12],
      classLevels: [
        {
          id: "p1",
          name: "Primary 1",
          ageRange: [6, 7],
          description: "First year of primary",
          subjects: ["English", "Mathematics", "Social Studies", "Science"],
        },
        {
          id: "p2",
          name: "Primary 2",
          ageRange: [7, 8],
          description: "Second year of primary",
          subjects: ["English", "Mathematics", "Social Studies", "Science"],
        },
        {
          id: "p3",
          name: "Primary 3",
          ageRange: [8, 9],
          description: "Third year of primary",
          subjects: ["English", "Mathematics", "Social Studies", "Science"],
        },
        {
          id: "p4",
          name: "Primary 4",
          ageRange: [9, 10],
          description: "Fourth year of primary",
          subjects: ["English", "Mathematics", "Social Studies", "Science"],
        },
        {
          id: "p5",
          name: "Primary 5",
          ageRange: [10, 11],
          description: "Fifth year of primary",
          subjects: ["English", "Mathematics", "Social Studies", "Science"],
        },
        {
          id: "p6",
          name: "Primary 6",
          ageRange: [11, 12],
          description: "Sixth year of primary",
          subjects: ["English", "Mathematics", "Social Studies", "Science"],
        },
        {
          id: "p7",
          name: "Primary 7",
          ageRange: [12, 13],
          description: "Seventh year of primary",
          subjects: ["English", "Mathematics", "Social Studies", "Science"],
        },
      ],
      subjects: [
        "English",
        "Mathematics",
        "Social Studies",
        "Science",
        "Religious Education",
        "Creative Arts",
      ],
      nationalExam: "Primary Leaving Examination (PLE)",
    },
    {
      id: "olevel",
      name: "O-Level (Ordinary Level)",
      description: "4 years of O-Level education",
      ageRange: [13, 16],
      classLevels: [
        {
          id: "s1",
          name: "Senior 1",
          ageRange: [13, 14],
          description: "First year of O-Level",
          subjects: [
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "s2",
          name: "Senior 2",
          ageRange: [14, 15],
          description: "Second year of O-Level",
          subjects: [
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "s3",
          name: "Senior 3",
          ageRange: [15, 16],
          description: "Third year of O-Level",
          subjects: [
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "s4",
          name: "Senior 4",
          ageRange: [16, 17],
          description: "Fourth year of O-Level",
          subjects: [
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
      ],
      subjects: [
        "English",
        "Mathematics",
        "Biology",
        "Chemistry",
        "Physics",
        "History",
        "Geography",
        "Economics",
        "Literature",
      ],
      nationalExam: "Uganda Certificate of Education (UCE)",
    },
    {
      id: "alevel",
      name: "A-Level (Advanced Level)",
      description: "2 years of A-Level education",
      ageRange: [17, 18],
      classLevels: [
        {
          id: "s5",
          name: "Senior 5",
          ageRange: [17, 18],
          description: "First year of A-Level",
          subjects: [
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "s6",
          name: "Senior 6",
          ageRange: [18, 19],
          description: "Second year of A-Level",
          subjects: [
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
      ],
      subjects: [
        "English",
        "Mathematics",
        "Biology",
        "Chemistry",
        "Physics",
        "History",
        "Geography",
        "Economics",
        "Literature",
      ],
      nationalExam: "Uganda Advanced Certificate of Education (UACE)",
    },
  ],
};

// Tanzanian Education System
const tanzanianSystem: EducationSystem = {
  id: "tanzania",
  country: "Tanzania",
  countryCode: "TZ",
  systemName: "Tanzanian Education System",
  description:
    "7-4-2-3 system: 7 years Primary, 4 years O-Level, 2 years A-Level, 3+ years University",
  flag: "🇹🇿",
  phoneCode: "+255",
  features: defaultFeatures,
  calendar: defaultCalendar,
  levels: [
    {
      id: "primary",
      name: "Primary School",
      description: "7 years of primary education",
      ageRange: [6, 12],
      classLevels: [
        {
          id: "std1",
          name: "Standard 1",
          ageRange: [6, 7],
          description: "First year of primary",
          subjects: ["Kiswahili", "English", "Mathematics", "Science"],
        },
        {
          id: "std2",
          name: "Standard 2",
          ageRange: [7, 8],
          description: "Second year of primary",
          subjects: ["Kiswahili", "English", "Mathematics", "Science"],
        },
        {
          id: "std3",
          name: "Standard 3",
          ageRange: [8, 9],
          description: "Third year of primary",
          subjects: ["Kiswahili", "English", "Mathematics", "Science"],
        },
        {
          id: "std4",
          name: "Standard 4",
          ageRange: [9, 10],
          description: "Fourth year of primary",
          subjects: ["Kiswahili", "English", "Mathematics", "Science"],
        },
        {
          id: "std5",
          name: "Standard 5",
          ageRange: [10, 11],
          description: "Fifth year of primary",
          subjects: ["Kiswahili", "English", "Mathematics", "Science"],
        },
        {
          id: "std6",
          name: "Standard 6",
          ageRange: [11, 12],
          description: "Sixth year of primary",
          subjects: ["Kiswahili", "English", "Mathematics", "Science"],
        },
        {
          id: "std7",
          name: "Standard 7",
          ageRange: [12, 13],
          description: "Seventh year of primary",
          subjects: ["Kiswahili", "English", "Mathematics", "Science"],
        },
      ],
      subjects: [
        "Kiswahili",
        "English",
        "Mathematics",
        "Science",
        "Social Studies",
        "Religious Education",
      ],
      nationalExam: "Primary School Leaving Examination (PSLE)",
    },
    {
      id: "olevel",
      name: "O-Level (Ordinary Level)",
      description: "4 years of O-Level education",
      ageRange: [13, 16],
      classLevels: [
        {
          id: "form1",
          name: "Form 1",
          ageRange: [13, 14],
          description: "First year of O-Level",
          subjects: [
            "Kiswahili",
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "form2",
          name: "Form 2",
          ageRange: [14, 15],
          description: "Second year of O-Level",
          subjects: [
            "Kiswahili",
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "form3",
          name: "Form 3",
          ageRange: [15, 16],
          description: "Third year of O-Level",
          subjects: [
            "Kiswahili",
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "form4",
          name: "Form 4",
          ageRange: [16, 17],
          description: "Fourth year of O-Level",
          subjects: [
            "Kiswahili",
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
      ],
      subjects: [
        "Kiswahili",
        "English",
        "Mathematics",
        "Biology",
        "Chemistry",
        "Physics",
        "History",
        "Geography",
        "Economics",
      ],
      nationalExam: "Certificate of Secondary Education (CSE)",
    },
    {
      id: "alevel",
      name: "A-Level (Advanced Level)",
      description: "2 years of A-Level education",
      ageRange: [17, 18],
      classLevels: [
        {
          id: "form5",
          name: "Form 5",
          ageRange: [17, 18],
          description: "First year of A-Level",
          subjects: [
            "Kiswahili",
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "form6",
          name: "Form 6",
          ageRange: [18, 19],
          description: "Second year of A-Level",
          subjects: [
            "Kiswahili",
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
      ],
      subjects: [
        "Kiswahili",
        "English",
        "Mathematics",
        "Biology",
        "Chemistry",
        "Physics",
        "History",
        "Geography",
        "Economics",
      ],
      nationalExam: "Advanced Certificate of Secondary Education (ACSE)",
    },
  ],
};

// South African Education System
const southAfricanSystem: EducationSystem = {
  id: "south_africa",
  country: "South Africa",
  countryCode: "ZA",
  systemName: "South African Education System",
  description:
    "7-5-3 system: 7 years Primary, 5 years Secondary, 3+ years University",
  flag: "🇿🇦",
  phoneCode: "+27",
  features: defaultFeatures,
  calendar: defaultCalendar,
  levels: [
    {
      id: "foundation",
      name: "Foundation Phase",
      description: "3 years of foundation phase (Grades R-3)",
      ageRange: [5, 8],
      classLevels: [
        {
          id: "grade_r",
          name: "Grade R",
          ageRange: [5, 6],
          description: "Reception year",
          subjects: [
            "Home Language",
            "First Additional Language",
            "Mathematics",
            "Life Skills",
          ],
        },
        {
          id: "grade1",
          name: "Grade 1",
          ageRange: [6, 7],
          description: "First year of foundation",
          subjects: [
            "Home Language",
            "First Additional Language",
            "Mathematics",
            "Life Skills",
          ],
        },
        {
          id: "grade2",
          name: "Grade 2",
          ageRange: [7, 8],
          description: "Second year of foundation",
          subjects: [
            "Home Language",
            "First Additional Language",
            "Mathematics",
            "Life Skills",
          ],
        },
        {
          id: "grade3",
          name: "Grade 3",
          ageRange: [8, 9],
          description: "Third year of foundation",
          subjects: [
            "Home Language",
            "First Additional Language",
            "Mathematics",
            "Life Skills",
          ],
        },
      ],
      subjects: [
        "Home Language",
        "First Additional Language",
        "Mathematics",
        "Life Skills",
      ],
    },
    {
      id: "intermediate",
      name: "Intermediate Phase",
      description: "3 years of intermediate phase (Grades 4-6)",
      ageRange: [9, 11],
      classLevels: [
        {
          id: "grade4",
          name: "Grade 4",
          ageRange: [9, 10],
          description: "First year of intermediate",
          subjects: [
            "Home Language",
            "First Additional Language",
            "Mathematics",
            "Natural Sciences",
            "Social Sciences",
            "Life Skills",
          ],
        },
        {
          id: "grade5",
          name: "Grade 5",
          ageRange: [10, 11],
          description: "Second year of intermediate",
          subjects: [
            "Home Language",
            "First Additional Language",
            "Mathematics",
            "Natural Sciences",
            "Social Sciences",
            "Life Skills",
          ],
        },
        {
          id: "grade6",
          name: "Grade 6",
          ageRange: [11, 12],
          description: "Third year of intermediate",
          subjects: [
            "Home Language",
            "First Additional Language",
            "Mathematics",
            "Natural Sciences",
            "Social Sciences",
            "Life Skills",
          ],
        },
      ],
      subjects: [
        "Home Language",
        "First Additional Language",
        "Mathematics",
        "Natural Sciences",
        "Social Sciences",
        "Life Skills",
      ],
    },
    {
      id: "senior",
      name: "Senior Phase",
      description: "3 years of senior phase (Grades 7-9)",
      ageRange: [12, 14],
      classLevels: [
        {
          id: "grade7",
          name: "Grade 7",
          ageRange: [12, 13],
          description: "First year of senior phase",
          subjects: [
            "Home Language",
            "First Additional Language",
            "Mathematics",
            "Natural Sciences",
            "Social Sciences",
            "Economic Management Sciences",
            "Creative Arts",
            "Technology",
          ],
        },
        {
          id: "grade8",
          name: "Grade 8",
          ageRange: [13, 14],
          description: "Second year of senior phase",
          subjects: [
            "Home Language",
            "First Additional Language",
            "Mathematics",
            "Natural Sciences",
            "Social Sciences",
            "Economic Management Sciences",
            "Creative Arts",
            "Technology",
          ],
        },
        {
          id: "grade9",
          name: "Grade 9",
          ageRange: [14, 15],
          description: "Third year of senior phase",
          subjects: [
            "Home Language",
            "First Additional Language",
            "Mathematics",
            "Natural Sciences",
            "Social Sciences",
            "Economic Management Sciences",
            "Creative Arts",
            "Technology",
          ],
        },
      ],
      subjects: [
        "Home Language",
        "First Additional Language",
        "Mathematics",
        "Natural Sciences",
        "Social Sciences",
        "Economic Management Sciences",
        "Creative Arts",
        "Technology",
      ],
      nationalExam: "General Education and Training Certificate (GETC)",
    },
    {
      id: "further",
      name: "Further Education and Training (FET)",
      description: "3 years of FET phase (Grades 10-12)",
      ageRange: [15, 17],
      classLevels: [
        {
          id: "grade10",
          name: "Grade 10",
          ageRange: [15, 16],
          description: "First year of FET",
          subjects: [
            "Home Language",
            "First Additional Language",
            "Mathematics",
            "Life Orientation",
            "Choice Subjects",
          ],
        },
        {
          id: "grade11",
          name: "Grade 11",
          ageRange: [16, 17],
          description: "Second year of FET",
          subjects: [
            "Home Language",
            "First Additional Language",
            "Mathematics",
            "Life Orientation",
            "Choice Subjects",
          ],
        },
        {
          id: "grade12",
          name: "Grade 12",
          ageRange: [17, 18],
          description: "Third year of FET",
          subjects: [
            "Home Language",
            "First Additional Language",
            "Mathematics",
            "Life Orientation",
            "Choice Subjects",
          ],
        },
      ],
      subjects: [
        "Home Language",
        "First Additional Language",
        "Mathematics",
        "Life Orientation",
        "Choice Subjects",
      ],
      nationalExam: "National Senior Certificate (NSC)",
    },
  ],
};

// Zimbabwean Education System
const zimbabweanSystem: EducationSystem = {
  id: "zimbabwe",
  country: "Zimbabwe",
  countryCode: "ZW",
  systemName: "Zimbabwean Education System",
  description:
    "7-4-2-3 system: 7 years Primary, 4 years O-Level, 2 years A-Level, 3+ years University",
  flag: "🇿🇼",
  phoneCode: "+263",
  features: defaultFeatures,
  calendar: defaultCalendar,
  levels: [
    {
      id: "primary",
      name: "Primary School",
      description: "7 years of primary education",
      ageRange: [6, 12],
      classLevels: [
        {
          id: "grade1",
          name: "Grade 1",
          ageRange: [6, 7],
          description: "First year of primary",
          subjects: [
            "English",
            "Shona/Ndebele",
            "Mathematics",
            "Environmental Science",
          ],
        },
        {
          id: "grade2",
          name: "Grade 2",
          ageRange: [7, 8],
          description: "Second year of primary",
          subjects: [
            "English",
            "Shona/Ndebele",
            "Mathematics",
            "Environmental Science",
          ],
        },
        {
          id: "grade3",
          name: "Grade 3",
          ageRange: [8, 9],
          description: "Third year of primary",
          subjects: [
            "English",
            "Shona/Ndebele",
            "Mathematics",
            "Environmental Science",
          ],
        },
        {
          id: "grade4",
          name: "Grade 4",
          ageRange: [9, 10],
          description: "Fourth year of primary",
          subjects: [
            "English",
            "Shona/Ndebele",
            "Mathematics",
            "Environmental Science",
          ],
        },
        {
          id: "grade5",
          name: "Grade 5",
          ageRange: [10, 11],
          description: "Fifth year of primary",
          subjects: [
            "English",
            "Shona/Ndebele",
            "Mathematics",
            "Environmental Science",
          ],
        },
        {
          id: "grade6",
          name: "Grade 6",
          ageRange: [11, 12],
          description: "Sixth year of primary",
          subjects: [
            "English",
            "Shona/Ndebele",
            "Mathematics",
            "Environmental Science",
          ],
        },
        {
          id: "grade7",
          name: "Grade 7",
          ageRange: [12, 13],
          description: "Seventh year of primary",
          subjects: [
            "English",
            "Shona/Ndebele",
            "Mathematics",
            "Environmental Science",
          ],
        },
      ],
      subjects: [
        "English",
        "Shona/Ndebele",
        "Mathematics",
        "Environmental Science",
        "Religious Education",
        "Creative Arts",
      ],
      nationalExam: "Primary School Leaving Certificate",
    },
    {
      id: "olevel",
      name: "O-Level (Ordinary Level)",
      description: "4 years of O-Level education",
      ageRange: [13, 16],
      classLevels: [
        {
          id: "form1",
          name: "Form 1",
          ageRange: [13, 14],
          description: "First year of O-Level",
          subjects: [
            "English",
            "Shona/Ndebele",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "form2",
          name: "Form 2",
          ageRange: [14, 15],
          description: "Second year of O-Level",
          subjects: [
            "English",
            "Shona/Ndebele",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "form3",
          name: "Form 3",
          ageRange: [15, 16],
          description: "Third year of O-Level",
          subjects: [
            "English",
            "Shona/Ndebele",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "form4",
          name: "Form 4",
          ageRange: [16, 17],
          description: "Fourth year of O-Level",
          subjects: [
            "English",
            "Shona/Ndebele",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
      ],
      subjects: [
        "English",
        "Shona/Ndebele",
        "Mathematics",
        "Biology",
        "Chemistry",
        "Physics",
        "History",
        "Geography",
        "Economics",
      ],
      nationalExam: "Zimbabwe Junior Certificate (ZJC)",
    },
    {
      id: "alevel",
      name: "A-Level (Advanced Level)",
      description: "2 years of A-Level education",
      ageRange: [17, 18],
      classLevels: [
        {
          id: "form5",
          name: "Form 5",
          ageRange: [17, 18],
          description: "First year of A-Level",
          subjects: [
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "form6",
          name: "Form 6",
          ageRange: [18, 19],
          description: "Second year of A-Level",
          subjects: [
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
      ],
      subjects: [
        "English",
        "Mathematics",
        "Biology",
        "Chemistry",
        "Physics",
        "History",
        "Geography",
        "Economics",
      ],
      nationalExam: "Zimbabwe General Certificate of Education (ZGCE)",
    },
  ],
};

// Senegalese Education System
const senegaleseSystem: EducationSystem = {
  id: "senegal",
  country: "Senegal",
  countryCode: "SN",
  systemName: "Senegalese Education System",
  description:
    "6-4-3 system: 6 years Primary, 4 years Collège, 3 years Lycée, 3+ years University",
  flag: "🇸🇳",
  phoneCode: "+221",
  features: defaultFeatures,
  calendar: defaultCalendar,
  levels: [
    {
      id: "primary",
      name: "École Primaire",
      description: "6 years of primary education",
      ageRange: [6, 11],
      classLevels: [
        {
          id: "cp1",
          name: "CP 1",
          ageRange: [6, 7],
          description: "Cours Préparatoire 1",
          subjects: ["Français", "Mathématiques", "Éveil"],
        },
        {
          id: "cp2",
          name: "CP 2",
          ageRange: [7, 8],
          description: "Cours Préparatoire 2",
          subjects: ["Français", "Mathématiques", "Éveil"],
        },
        {
          id: "ce1",
          name: "CE 1",
          ageRange: [8, 9],
          description: "Cours Élémentaire 1",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
          ],
        },
        {
          id: "ce2",
          name: "CE 2",
          ageRange: [9, 10],
          description: "Cours Élémentaire 2",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
          ],
        },
        {
          id: "cm1",
          name: "CM 1",
          ageRange: [10, 11],
          description: "Cours Moyen 1",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
          ],
        },
        {
          id: "cm2",
          name: "CM 2",
          ageRange: [11, 12],
          description: "Cours Moyen 2",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
          ],
        },
      ],
      subjects: [
        "Français",
        "Mathématiques",
        "Histoire-Géographie",
        "Sciences",
        "Éducation Civique",
      ],
      nationalExam: "Certificat de Fin d'Études Élémentaires (CFEE)",
    },
    {
      id: "college",
      name: "Collège",
      description: "4 years of collège education",
      ageRange: [12, 15],
      classLevels: [
        {
          id: "sixieme",
          name: "6ème",
          ageRange: [12, 13],
          description: "Sixième année",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
        {
          id: "cinquieme",
          name: "5ème",
          ageRange: [13, 14],
          description: "Cinquième année",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
        {
          id: "quatrieme",
          name: "4ème",
          ageRange: [14, 15],
          description: "Quatrième année",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
        {
          id: "troisieme",
          name: "3ème",
          ageRange: [15, 16],
          description: "Troisième année",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
      ],
      subjects: [
        "Français",
        "Mathématiques",
        "Histoire-Géographie",
        "Sciences",
        "Anglais",
        "Espagnol",
        "Allemand",
      ],
      nationalExam: "Brevet de Fin d'Études Moyennes (BFEM)",
    },
    {
      id: "lycee",
      name: "Lycée",
      description: "3 years of lycée education",
      ageRange: [16, 18],
      classLevels: [
        {
          id: "seconde",
          name: "Seconde",
          ageRange: [16, 17],
          description: "Seconde année",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
        {
          id: "premiere",
          name: "Première",
          ageRange: [17, 18],
          description: "Première année",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
        {
          id: "terminale",
          name: "Terminale",
          ageRange: [18, 19],
          description: "Terminale année",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
      ],
      subjects: [
        "Français",
        "Mathématiques",
        "Histoire-Géographie",
        "Sciences",
        "Anglais",
        "Philosophie",
      ],
      nationalExam: "Baccalauréat",
    },
  ],
};

// Ivorian Education System
const ivorianSystem: EducationSystem = {
  id: "cote_divoire",
  country: "Côte d'Ivoire",
  countryCode: "CI",
  systemName: "Ivorian Education System",
  description:
    "6-4-3 system: 6 years Primary, 4 years Collège, 3 years Lycée, 3+ years University",
  flag: "🇨🇮",
  phoneCode: "+225",
  features: defaultFeatures,
  calendar: defaultCalendar,
  levels: [
    {
      id: "primary",
      name: "École Primaire",
      description: "6 years of primary education",
      ageRange: [6, 11],
      classLevels: [
        {
          id: "cp1",
          name: "CP 1",
          ageRange: [6, 7],
          description: "Cours Préparatoire 1",
          subjects: ["Français", "Mathématiques", "Éveil"],
        },
        {
          id: "cp2",
          name: "CP 2",
          ageRange: [7, 8],
          description: "Cours Préparatoire 2",
          subjects: ["Français", "Mathématiques", "Éveil"],
        },
        {
          id: "ce1",
          name: "CE 1",
          ageRange: [8, 9],
          description: "Cours Élémentaire 1",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
          ],
        },
        {
          id: "ce2",
          name: "CE 2",
          ageRange: [9, 10],
          description: "Cours Élémentaire 2",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
          ],
        },
        {
          id: "cm1",
          name: "CM 1",
          ageRange: [10, 11],
          description: "Cours Moyen 1",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
          ],
        },
        {
          id: "cm2",
          name: "CM 2",
          ageRange: [11, 12],
          description: "Cours Moyen 2",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
          ],
        },
      ],
      subjects: [
        "Français",
        "Mathématiques",
        "Histoire-Géographie",
        "Sciences",
        "Éducation Civique",
      ],
      nationalExam: "Certificat d'Études Primaires Élémentaires (CEPE)",
    },
    {
      id: "college",
      name: "Collège",
      description: "4 years of collège education",
      ageRange: [12, 15],
      classLevels: [
        {
          id: "sixieme",
          name: "6ème",
          ageRange: [12, 13],
          description: "Sixième année",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
        {
          id: "cinquieme",
          name: "5ème",
          ageRange: [13, 14],
          description: "Cinquième année",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
        {
          id: "quatrieme",
          name: "4ème",
          ageRange: [14, 15],
          description: "Quatrième année",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
        {
          id: "troisieme",
          name: "3ème",
          ageRange: [15, 16],
          description: "Troisième année",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
      ],
      subjects: [
        "Français",
        "Mathématiques",
        "Histoire-Géographie",
        "Sciences",
        "Anglais",
        "Espagnol",
        "Allemand",
      ],
      nationalExam: "Brevet d'Études du Premier Cycle (BEPC)",
    },
    {
      id: "lycee",
      name: "Lycée",
      description: "3 years of lycée education",
      ageRange: [16, 18],
      classLevels: [
        {
          id: "seconde",
          name: "Seconde",
          ageRange: [16, 17],
          description: "Seconde année",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
        {
          id: "premiere",
          name: "Première",
          ageRange: [17, 18],
          description: "Première année",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
        {
          id: "terminale",
          name: "Terminale",
          ageRange: [18, 19],
          description: "Terminale année",
          subjects: [
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
      ],
      subjects: [
        "Français",
        "Mathématiques",
        "Histoire-Géographie",
        "Sciences",
        "Anglais",
        "Philosophie",
      ],
      nationalExam: "Baccalauréat",
    },
  ],
};

// Egyptian Education System
const egyptianSystem: EducationSystem = {
  id: "egypt",
  country: "Egypt",
  countryCode: "EG",
  systemName: "Egyptian Education System",
  description:
    "6-3-3 system: 6 years Primary, 3 years Preparatory, 3 years Secondary, 4+ years University",
  flag: "🇪🇬",
  phoneCode: "+20",
  features: defaultFeatures,
  calendar: defaultCalendar,
  levels: [
    {
      id: "primary",
      name: "Primary School",
      description: "6 years of primary education",
      ageRange: [6, 11],
      classLevels: [
        {
          id: "primary1",
          name: "Primary 1",
          ageRange: [6, 7],
          description: "First year of primary",
          subjects: [
            "Arabic",
            "English",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "primary2",
          name: "Primary 2",
          ageRange: [7, 8],
          description: "Second year of primary",
          subjects: [
            "Arabic",
            "English",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "primary3",
          name: "Primary 3",
          ageRange: [8, 9],
          description: "Third year of primary",
          subjects: [
            "Arabic",
            "English",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "primary4",
          name: "Primary 4",
          ageRange: [9, 10],
          description: "Fourth year of primary",
          subjects: [
            "Arabic",
            "English",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "primary5",
          name: "Primary 5",
          ageRange: [10, 11],
          description: "Fifth year of primary",
          subjects: [
            "Arabic",
            "English",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "primary6",
          name: "Primary 6",
          ageRange: [11, 12],
          description: "Sixth year of primary",
          subjects: [
            "Arabic",
            "English",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
      ],
      subjects: [
        "Arabic",
        "English",
        "Mathematics",
        "Science",
        "Social Studies",
        "Religious Education",
        "Art",
        "Music",
      ],
      nationalExam: "Primary School Certificate",
    },
    {
      id: "preparatory",
      name: "Preparatory School",
      description: "3 years of preparatory education",
      ageRange: [12, 14],
      classLevels: [
        {
          id: "prep1",
          name: "Preparatory 1",
          ageRange: [12, 13],
          description: "First year of preparatory",
          subjects: [
            "Arabic",
            "English",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "prep2",
          name: "Preparatory 2",
          ageRange: [13, 14],
          description: "Second year of preparatory",
          subjects: [
            "Arabic",
            "English",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "prep3",
          name: "Preparatory 3",
          ageRange: [14, 15],
          description: "Third year of preparatory",
          subjects: [
            "Arabic",
            "English",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
      ],
      subjects: [
        "Arabic",
        "English",
        "Mathematics",
        "Science",
        "Social Studies",
        "Religious Education",
        "Art",
        "Music",
      ],
      nationalExam: "Preparatory School Certificate",
    },
    {
      id: "secondary",
      name: "Secondary School",
      description: "3 years of secondary education",
      ageRange: [15, 17],
      classLevels: [
        {
          id: "secondary1",
          name: "Secondary 1",
          ageRange: [15, 16],
          description: "First year of secondary",
          subjects: [
            "Arabic",
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "secondary2",
          name: "Secondary 2",
          ageRange: [16, 17],
          description: "Second year of secondary",
          subjects: [
            "Arabic",
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
        {
          id: "secondary3",
          name: "Secondary 3",
          ageRange: [17, 18],
          description: "Third year of secondary",
          subjects: [
            "Arabic",
            "English",
            "Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
          ],
        },
      ],
      subjects: [
        "Arabic",
        "English",
        "Mathematics",
        "Biology",
        "Chemistry",
        "Physics",
        "History",
        "Geography",
        "Economics",
      ],
      nationalExam: "General Secondary Education Certificate (Thanaweya Amma)",
    },
  ],
};

// Moroccan Education System
const moroccanSystem: EducationSystem = {
  id: "morocco",
  country: "Morocco",
  countryCode: "MA",
  systemName: "Moroccan Education System",
  description:
    "6-3-3 system: 6 years Primary, 3 years Collège, 3 years Lycée, 3+ years University",
  flag: "🇲🇦",
  phoneCode: "+212",
  features: defaultFeatures,
  calendar: defaultCalendar,
  levels: [
    {
      id: "primary",
      name: "École Primaire",
      description: "6 years of primary education",
      ageRange: [6, 11],
      classLevels: [
        {
          id: "cp1",
          name: "CP 1",
          ageRange: [6, 7],
          description: "Cours Préparatoire 1",
          subjects: ["Arabe", "Français", "Mathématiques", "Éveil"],
        },
        {
          id: "cp2",
          name: "CP 2",
          ageRange: [7, 8],
          description: "Cours Préparatoire 2",
          subjects: ["Arabe", "Français", "Mathématiques", "Éveil"],
        },
        {
          id: "ce1",
          name: "CE 1",
          ageRange: [8, 9],
          description: "Cours Élémentaire 1",
          subjects: [
            "Arabe",
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
          ],
        },
        {
          id: "ce2",
          name: "CE 2",
          ageRange: [9, 10],
          description: "Cours Élémentaire 2",
          subjects: [
            "Arabe",
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
          ],
        },
        {
          id: "cm1",
          name: "CM 1",
          ageRange: [10, 11],
          description: "Cours Moyen 1",
          subjects: [
            "Arabe",
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
          ],
        },
        {
          id: "cm2",
          name: "CM 2",
          ageRange: [11, 12],
          description: "Cours Moyen 2",
          subjects: [
            "Arabe",
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
          ],
        },
      ],
      subjects: [
        "Arabe",
        "Français",
        "Mathématiques",
        "Histoire-Géographie",
        "Sciences",
        "Éducation Islamique",
      ],
      nationalExam: "Certificat d'Études Primaires",
    },
    {
      id: "college",
      name: "Collège",
      description: "3 years of collège education",
      ageRange: [12, 14],
      classLevels: [
        {
          id: "sixieme",
          name: "6ème",
          ageRange: [12, 13],
          description: "Sixième année",
          subjects: [
            "Arabe",
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
        {
          id: "cinquieme",
          name: "5ème",
          ageRange: [13, 14],
          description: "Cinquième année",
          subjects: [
            "Arabe",
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
        {
          id: "quatrieme",
          name: "4ème",
          ageRange: [14, 15],
          description: "Quatrième année",
          subjects: [
            "Arabe",
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
      ],
      subjects: [
        "Arabe",
        "Français",
        "Mathématiques",
        "Histoire-Géographie",
        "Sciences",
        "Anglais",
        "Éducation Islamique",
      ],
      nationalExam: "Brevet d'Études du Premier Cycle (BEPC)",
    },
    {
      id: "lycee",
      name: "Lycée",
      description: "3 years of lycée education",
      ageRange: [15, 17],
      classLevels: [
        {
          id: "seconde",
          name: "Seconde",
          ageRange: [15, 16],
          description: "Seconde année",
          subjects: [
            "Arabe",
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
        {
          id: "premiere",
          name: "Première",
          ageRange: [16, 17],
          description: "Première année",
          subjects: [
            "Arabe",
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
        {
          id: "terminale",
          name: "Terminale",
          ageRange: [17, 18],
          description: "Terminale année",
          subjects: [
            "Arabe",
            "Français",
            "Mathématiques",
            "Histoire-Géographie",
            "Sciences",
            "Anglais",
          ],
        },
      ],
      subjects: [
        "Arabe",
        "Français",
        "Mathématiques",
        "Histoire-Géographie",
        "Sciences",
        "Anglais",
        "Philosophie",
        "Éducation Islamique",
      ],
      nationalExam: "Baccalauréat",
    },
  ],
};

// American Education System
const americanSystem: EducationSystem = {
  id: "usa",
  country: "United States",
  countryCode: "US",
  systemName: "American Education System",
  description:
    "K-12 system: Kindergarten through 12th Grade, 4+ years University",
  flag: "🇺🇸",
  phoneCode: "+1",
  features: defaultFeatures,
  calendar: defaultCalendar,
  levels: [
    {
      id: "elementary",
      name: "Elementary School",
      description: "5 years of elementary education (K-5)",
      ageRange: [5, 10],
      classLevels: [
        {
          id: "kindergarten",
          name: "Kindergarten",
          ageRange: [5, 6],
          description: "Kindergarten year",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade1",
          name: "1st Grade",
          ageRange: [6, 7],
          description: "First grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade2",
          name: "2nd Grade",
          ageRange: [7, 8],
          description: "Second grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade3",
          name: "3rd Grade",
          ageRange: [8, 9],
          description: "Third grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade4",
          name: "4th Grade",
          ageRange: [9, 10],
          description: "Fourth grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade5",
          name: "5th Grade",
          ageRange: [10, 11],
          description: "Fifth grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
      ],
      subjects: [
        "English Language Arts",
        "Mathematics",
        "Science",
        "Social Studies",
        "Physical Education",
        "Art",
        "Music",
      ],
    },
    {
      id: "middle",
      name: "Middle School",
      description: "3 years of middle school education (6-8)",
      ageRange: [11, 13],
      classLevels: [
        {
          id: "grade6",
          name: "6th Grade",
          ageRange: [11, 12],
          description: "Sixth grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade7",
          name: "7th Grade",
          ageRange: [12, 13],
          description: "Seventh grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade8",
          name: "8th Grade",
          ageRange: [13, 14],
          description: "Eighth grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
      ],
      subjects: [
        "English Language Arts",
        "Mathematics",
        "Science",
        "Social Studies",
        "Physical Education",
        "Art",
        "Music",
        "Foreign Language",
      ],
    },
    {
      id: "high",
      name: "High School",
      description: "4 years of high school education (9-12)",
      ageRange: [14, 17],
      classLevels: [
        {
          id: "grade9",
          name: "9th Grade (Freshman)",
          ageRange: [14, 15],
          description: "Freshman year",
          subjects: ["English", "Mathematics", "Science", "Social Studies"],
        },
        {
          id: "grade10",
          name: "10th Grade (Sophomore)",
          ageRange: [15, 16],
          description: "Sophomore year",
          subjects: ["English", "Mathematics", "Science", "Social Studies"],
        },
        {
          id: "grade11",
          name: "11th Grade (Junior)",
          ageRange: [16, 17],
          description: "Junior year",
          subjects: ["English", "Mathematics", "Science", "Social Studies"],
        },
        {
          id: "grade12",
          name: "12th Grade (Senior)",
          ageRange: [17, 18],
          description: "Senior year",
          subjects: ["English", "Mathematics", "Science", "Social Studies"],
        },
      ],
      subjects: [
        "English",
        "Mathematics",
        "Science",
        "Social Studies",
        "Physical Education",
        "Art",
        "Music",
        "Foreign Language",
        "Electives",
      ],
      nationalExam: "High School Diploma",
    },
  ],
};

// British Education System
const britishSystem: EducationSystem = {
  id: "uk",
  country: "United Kingdom",
  countryCode: "GB",
  systemName: "British Education System",
  description:
    "4-6-2-3 system: 4 years Primary, 6 years Secondary, 2 years A-Level, 3+ years University",
  flag: "🇬🇧",
  phoneCode: "+44",
  features: defaultFeatures,
  calendar: defaultCalendar,
  levels: [
    {
      id: "primary",
      name: "Primary School",
      description: "6 years of primary education (Reception to Year 6)",
      ageRange: [4, 10],
      classLevels: [
        {
          id: "reception",
          name: "Reception",
          ageRange: [4, 5],
          description: "Reception year",
          subjects: [
            "English",
            "Mathematics",
            "Science",
            "Art",
            "Design & Technology",
          ],
        },
        {
          id: "year1",
          name: "Year 1",
          ageRange: [5, 6],
          description: "First year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Science",
            "Art",
            "Design & Technology",
          ],
        },
        {
          id: "year2",
          name: "Year 2",
          ageRange: [6, 7],
          description: "Second year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Science",
            "Art",
            "Design & Technology",
          ],
        },
        {
          id: "year3",
          name: "Year 3",
          ageRange: [7, 8],
          description: "Third year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Science",
            "Art",
            "Design & Technology",
          ],
        },
        {
          id: "year4",
          name: "Year 4",
          ageRange: [8, 9],
          description: "Fourth year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Science",
            "Art",
            "Design & Technology",
          ],
        },
        {
          id: "year5",
          name: "Year 5",
          ageRange: [9, 10],
          description: "Fifth year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Science",
            "Art",
            "Design & Technology",
          ],
        },
        {
          id: "year6",
          name: "Year 6",
          ageRange: [10, 11],
          description: "Sixth year of primary",
          subjects: [
            "English",
            "Mathematics",
            "Science",
            "Art",
            "Design & Technology",
          ],
        },
      ],
      subjects: [
        "English",
        "Mathematics",
        "Science",
        "Art",
        "Design & Technology",
        "History",
        "Geography",
        "Music",
        "Physical Education",
        "Computing",
      ],
      nationalExam: "Key Stage 2 SATs",
    },
    {
      id: "secondary",
      name: "Secondary School",
      description: "5 years of secondary education (Year 7 to Year 11)",
      ageRange: [11, 15],
      classLevels: [
        {
          id: "year7",
          name: "Year 7",
          ageRange: [11, 12],
          description: "First year of secondary",
          subjects: [
            "English",
            "Mathematics",
            "Science",
            "History",
            "Geography",
          ],
        },
        {
          id: "year8",
          name: "Year 8",
          ageRange: [12, 13],
          description: "Second year of secondary",
          subjects: [
            "English",
            "Mathematics",
            "Science",
            "History",
            "Geography",
          ],
        },
        {
          id: "year9",
          name: "Year 9",
          ageRange: [13, 14],
          description: "Third year of secondary",
          subjects: [
            "English",
            "Mathematics",
            "Science",
            "History",
            "Geography",
          ],
        },
        {
          id: "year10",
          name: "Year 10",
          ageRange: [14, 15],
          description: "Fourth year of secondary",
          subjects: [
            "English",
            "Mathematics",
            "Science",
            "History",
            "Geography",
          ],
        },
        {
          id: "year11",
          name: "Year 11",
          ageRange: [15, 16],
          description: "Fifth year of secondary",
          subjects: [
            "English",
            "Mathematics",
            "Science",
            "History",
            "Geography",
          ],
        },
      ],
      subjects: [
        "English",
        "Mathematics",
        "Science",
        "History",
        "Geography",
        "Art",
        "Music",
        "Physical Education",
        "Design & Technology",
        "Computing",
        "Modern Foreign Languages",
      ],
      nationalExam: "General Certificate of Secondary Education (GCSE)",
    },
    {
      id: "sixth_form",
      name: "Sixth Form",
      description: "2 years of sixth form education (Year 12 to Year 13)",
      ageRange: [16, 17],
      classLevels: [
        {
          id: "year12",
          name: "Year 12 (Lower Sixth)",
          ageRange: [16, 17],
          description: "First year of sixth form",
          subjects: ["A-Level Subjects"],
        },
        {
          id: "year13",
          name: "Year 13 (Upper Sixth)",
          ageRange: [17, 18],
          description: "Second year of sixth form",
          subjects: ["A-Level Subjects"],
        },
      ],
      subjects: ["A-Level Subjects"],
      nationalExam: "General Certificate of Education Advanced Level (A-Level)",
    },
  ],
};

// Canadian Education System
const canadianSystem: EducationSystem = {
  id: "canada",
  country: "Canada",
  countryCode: "CA",
  systemName: "Canadian Education System",
  description:
    "K-12 system: Kindergarten through 12th Grade, 3-4 years University",
  flag: "🇨🇦",
  phoneCode: "+1",
  features: defaultFeatures,
  calendar: defaultCalendar,
  levels: [
    {
      id: "elementary",
      name: "Elementary School",
      description: "8 years of elementary education (K-7)",
      ageRange: [5, 12],
      classLevels: [
        {
          id: "kindergarten",
          name: "Kindergarten",
          ageRange: [5, 6],
          description: "Kindergarten year",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade1",
          name: "Grade 1",
          ageRange: [6, 7],
          description: "First grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade2",
          name: "Grade 2",
          ageRange: [7, 8],
          description: "Second grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade3",
          name: "Grade 3",
          ageRange: [8, 9],
          description: "Third grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade4",
          name: "Grade 4",
          ageRange: [9, 10],
          description: "Fourth grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade5",
          name: "Grade 5",
          ageRange: [10, 11],
          description: "Fifth grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade6",
          name: "Grade 6",
          ageRange: [11, 12],
          description: "Sixth grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade7",
          name: "Grade 7",
          ageRange: [12, 13],
          description: "Seventh grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
      ],
      subjects: [
        "English Language Arts",
        "Mathematics",
        "Science",
        "Social Studies",
        "Physical Education",
        "Art",
        "Music",
        "French",
      ],
    },
    {
      id: "secondary",
      name: "Secondary School",
      description: "4 years of secondary education (8-12)",
      ageRange: [13, 16],
      classLevels: [
        {
          id: "grade8",
          name: "Grade 8",
          ageRange: [13, 14],
          description: "Eighth grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade9",
          name: "Grade 9",
          ageRange: [14, 15],
          description: "Ninth grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade10",
          name: "Grade 10",
          ageRange: [15, 16],
          description: "Tenth grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade11",
          name: "Grade 11",
          ageRange: [16, 17],
          description: "Eleventh grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
        {
          id: "grade12",
          name: "Grade 12",
          ageRange: [17, 18],
          description: "Twelfth grade",
          subjects: [
            "English Language Arts",
            "Mathematics",
            "Science",
            "Social Studies",
          ],
        },
      ],
      subjects: [
        "English Language Arts",
        "Mathematics",
        "Science",
        "Social Studies",
        "Physical Education",
        "Art",
        "Music",
        "French",
        "Electives",
      ],
      nationalExam: "High School Diploma",
    },
  ],
};

// All available education systems
export const educationSystems: EducationSystem[] = [
  nigerianSystem,
  ghanaianSystem,
  kenyanSystem,
  ugandanSystem,
  tanzanianSystem,
  southAfricanSystem,
  zimbabweanSystem,
  senegaleseSystem,
  ivorianSystem,
  egyptianSystem,
  moroccanSystem,
  americanSystem,
  britishSystem,
  canadianSystem,
];

// Education system mapping by country
export const systemsByCountry: Record<string, EducationSystem[]> = {
  NG: [nigerianSystem],
  GH: [ghanaianSystem],
  KE: [kenyanSystem],
  UG: [ugandanSystem],
  TZ: [tanzanianSystem],
  ZA: [southAfricanSystem],
  ZW: [zimbabweanSystem],
  SN: [senegaleseSystem],
  CI: [ivorianSystem],
  EG: [egyptianSystem],
  MA: [moroccanSystem],
  US: [americanSystem],
  GB: [britishSystem],
  CA: [canadianSystem],
};

// Get education system by country code
export function getEducationSystem(
  countryCode: string
): EducationSystem | undefined {
  const systems = systemsByCountry[countryCode];
  return systems ? systems[0] : undefined;
}

// Get available countries with flags and phone codes
export function getAvailableCountries() {
  return [
    { code: "NG", name: "Nigeria", flag: "🇳🇬", phoneCode: "+234" },
    { code: "GH", name: "Ghana", flag: "🇬🇭", phoneCode: "+233" },
    { code: "KE", name: "Kenya", flag: "🇰🇪", phoneCode: "+254" },
    { code: "UG", name: "Uganda", flag: "🇺🇬", phoneCode: "+256" },
    { code: "TZ", name: "Tanzania", flag: "🇹🇿", phoneCode: "+255" },
    { code: "ZA", name: "South Africa", flag: "🇿🇦", phoneCode: "+27" },
    { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", phoneCode: "+263" },
    { code: "SN", name: "Senegal", flag: "🇸🇳", phoneCode: "+221" },
    { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", phoneCode: "+225" },
    { code: "EG", name: "Egypt", flag: "🇪🇬", phoneCode: "+20" },
    { code: "MA", name: "Morocco", flag: "🇲🇦", phoneCode: "+212" },
    { code: "US", name: "United States", flag: "🇺🇸", phoneCode: "+1" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧", phoneCode: "+44" },
    { code: "CA", name: "Canada", flag: "🇨🇦", phoneCode: "+1" },
  ].sort((a, b) => {
    // Sort alphabetically but put Nigeria first
    if (a.code === "NG") return -1;
    if (b.code === "NG") return 1;
    return a.name.localeCompare(b.name);
  });
}

// Get school level display names for a country
export function getSchoolLevelDisplayNames(countryCode: string) {
  const system = getEducationSystem(countryCode);
  if (!system) return [];

  return system.levels.map((level) => ({
    value: level.id,
    label: level.name,
  }));
}

// Get education system by ID
export function getEducationSystemById(
  id: string
): EducationSystem | undefined {
  return educationSystems.find((system) => system.id === id);
}

// Get systems by country code
export function getSystemsByCountryCode(
  countryCode: string
): EducationSystem[] {
  return systemsByCountry[countryCode] || [];
}

// Suggest education systems based on country and school type
export function suggestEducationSystems(
  countryCode: string,
  schoolType: "primary" | "secondary" | "tertiary"
): SystemSuggestion[] {
  const countrySystems = getSystemsByCountryCode(countryCode);
  const suggestions: SystemSuggestion[] = [];

  countrySystems.forEach((system) => {
    const hasRelevantLevel = system.levels.some((level) => {
      if (schoolType === "primary") {
        return (
          level.id.includes("primary") ||
          level.id.includes("nursery") ||
          level.id.includes("kindergarten")
        );
      }
      if (schoolType === "secondary") {
        return (
          level.id.includes("secondary") ||
          level.id.includes("jss") ||
          level.id.includes("sss") ||
          level.id.includes("jhs") ||
          level.id.includes("shs") ||
          level.id.includes("olevel") ||
          level.id.includes("alevel")
        );
      }
      return true;
    });

    if (hasRelevantLevel) {
      suggestions.push({
        systemId: system.id,
        confidence: 1.0,
        customizations: [],
        reasoning: `Perfect match for ${system.country} schools`,
      });
    }
  });

  return suggestions;
}

// Helper functions for subjects and class levels
export function getSubjectsForLevel(
  systemId: string,
  levelId: string
): SubjectDefinition[] {
  const system = getEducationSystemById(systemId);
  const level = system?.levels.find((l) => l.id === levelId);
  const subjectStrings = level?.subjects || [];

  return subjectStrings.map((subjectName, index) => ({
    id: `subject-${levelId}-${index}`,
    name: subjectName,
    category: getSubjectCategory(subjectName),
    isRequired: true, // Default to required
    applicableLevels: [levelId],
    description: `${subjectName} for ${level?.name || levelId}`,
  }));
}

export function getClassLevelsForLevel(
  systemId: string,
  levelId: string
): ClassLevel[] {
  const system = getEducationSystemById(systemId);
  const level = system?.levels.find((l) => l.id === levelId);
  return level?.classLevels || [];
}

export function getSubjectsForClassLevel(
  systemId: string,
  classLevelId: string
): string[] {
  const system = getEducationSystemById(systemId);
  for (const level of system?.levels || []) {
    const classLevel = level.classLevels.find((cl) => cl.id === classLevelId);
    if (classLevel) return classLevel.subjects;
  }
  return [];
}

export function isValidClassLevel(
  systemId: string,
  classLevelId: string
): boolean {
  const system = getEducationSystemById(systemId);
  for (const level of system?.levels || []) {
    if (level.classLevels.some((cl) => cl.id === classLevelId)) {
      return true;
    }
  }
  return false;
}

export function getGradingScale(
  systemId: string,
  levelId?: string
): GradingScale {
  // Default grading scale - can be customized per system/level
  return {
    id: "default-grading",
    name: "Standard Letter Grading",
    type: "letter",
    passingGrade: 50,
    maxScore: 100,
    ranges: [
      { min: 80, max: 100, grade: "A", gpa: 4.0, description: "Excellent" },
      { min: 70, max: 79, grade: "B", gpa: 3.0, description: "Very Good" },
      { min: 60, max: 69, grade: "C", gpa: 2.0, description: "Good" },
      { min: 50, max: 59, grade: "D", gpa: 1.0, description: "Pass" },
      { min: 0, max: 49, grade: "F", gpa: 0.0, description: "Fail" },
    ],
  };
}

export function getAcademicTerms(
  systemId: string,
  levelId?: string
): AcademicTerm[] {
  // Default academic terms - can be customized per system/level
  return [
    {
      id: "term1",
      name: "First Term",
      startMonth: 9,
      endMonth: 12,
      isExamTerm: false,
      description: "First academic term",
    },
    {
      id: "term2",
      name: "Second Term",
      startMonth: 1,
      endMonth: 4,
      isExamTerm: true,
      description: "Second academic term with exams",
    },
    {
      id: "term3",
      name: "Third Term",
      startMonth: 4,
      endMonth: 7,
      isExamTerm: true,
      description: "Final academic term with exams",
    },
  ];
}

function getSubjectCategory(subject: string): SubjectDefinition["category"] {
  const subjectLower = subject.toLowerCase();

  if (
    subjectLower.includes("math") ||
    subjectLower.includes("english") ||
    subjectLower.includes("language")
  ) {
    return "core";
  } else if (
    subjectLower.includes("science") ||
    subjectLower.includes("biology") ||
    subjectLower.includes("chemistry") ||
    subjectLower.includes("physics")
  ) {
    return "science";
  } else if (
    subjectLower.includes("history") ||
    subjectLower.includes("geography") ||
    subjectLower.includes("social")
  ) {
    return "social";
  } else if (
    subjectLower.includes("art") ||
    subjectLower.includes("music") ||
    subjectLower.includes("creative")
  ) {
    return "arts";
  } else if (
    subjectLower.includes("french") ||
    subjectLower.includes("spanish") ||
    subjectLower.includes("arabic")
  ) {
    return "language";
  } else {
    return "vocational";
  }
}
