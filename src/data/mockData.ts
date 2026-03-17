// ── Types ──────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  avatar: string;
  status: 'available' | 'busy' | 'away';
  currentTask: string;
  currentTaskAr: string;
  workload: number;
  email: string;
  phone: string;
  joinDate: string;
  skills: string[];
  skillsAr: string[];
}

export interface Project {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  progress: number;
  color: string;
  tasksTotal: number;
  tasksCompleted: number;
  status: 'active' | 'on-hold' | 'completed';
  startDate: string;
  endDate: string;
  teamIds: string[];
  tags: string[];
  tagsAr: string[];
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  projectId: string;
  tags: string[];
  tagsAr: string[];
  dueDate: string;
  createdAt: string;
  storyPoints: number;
  sprintId: string;
}

export type DesignItemType = 'ui' | '3d-model' | 'animation' | 'concept-art' | 'icon' | 'texture';

export interface DesignItem {
  id: string;
  title: string;
  titleAr: string;
  type: DesignItemType;
  status: 'draft' | 'in-review' | 'approved' | 'revision';
  assigneeId: string;
  projectId: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  comments: number;
}

export type SprintStatus = 'planning' | 'active' | 'completed';

export interface Sprint {
  id: string;
  name: string;
  nameAr: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  goals: string[];
  goalsAr: string[];
  taskIds: string[];
  velocity: number;
  totalPoints: number;
  completedPoints: number;
}

export interface Activity {
  id: string;
  user: TeamMember;
  action: string;
  actionAr: string;
  target: string;
  targetAr: string;
  time: string;
  timeAr: string;
}

export interface KPI {
  labelEn: string;
  labelAr: string;
  value: number;
  change: number;
  color: string;
  icon: string;
}

export interface BoardColumn {
  id: TaskStatus;
  titleEn: string;
  titleAr: string;
  color: string;
}

// ── Data ───────────────────────────────────────────────

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Waleed Al-Rashid',
    nameAr: 'وليد الراشد',
    role: 'Lead Developer',
    roleAr: 'مطور رئيسي',
    avatar: '\u{1F468}\u{200D}\u{1F4BB}',
    status: 'busy',
    currentTask: 'Fix drift physics',
    currentTaskAr: 'إصلاح فيزياء الانجراف',
    workload: 85,
    email: 'waleed@njdgames.com',
    phone: '+966 50 123 4567',
    joinDate: '2023-01-15',
    skills: ['Unity', 'C#', 'Physics Engine', 'Multiplayer'],
    skillsAr: ['يونتي', 'سي شارب', 'محرك الفيزياء', 'اللعب الجماعي'],
  },
  {
    id: '2',
    name: 'Nora Al-Saud',
    nameAr: 'نورة آل سعود',
    role: 'UI/UX Designer',
    roleAr: 'مصممة واجهات',
    avatar: '\u{1F469}\u{200D}\u{1F3A8}',
    status: 'available',
    currentTask: 'Design start screen',
    currentTaskAr: 'تصميم شاشة البداية',
    workload: 60,
    email: 'nora@njdgames.com',
    phone: '+966 50 234 5678',
    joinDate: '2023-03-20',
    skills: ['Figma', 'UI Design', 'Prototyping', 'Motion Design'],
    skillsAr: ['فيجما', 'تصميم واجهات', 'النماذج الأولية', 'تصميم الحركة'],
  },
  {
    id: '3',
    name: 'Fahad Al-Otaibi',
    nameAr: 'فهد العتيبي',
    role: 'Game Designer',
    roleAr: 'مصمم ألعاب',
    avatar: '\u{1F3AE}',
    status: 'busy',
    currentTask: 'Balance track difficulty',
    currentTaskAr: 'موازنة صعوبة المسارات',
    workload: 92,
    email: 'fahad@njdgames.com',
    phone: '+966 50 345 6789',
    joinDate: '2023-02-10',
    skills: ['Game Design', 'Level Design', 'Balancing', 'Documentation'],
    skillsAr: ['تصميم الألعاب', 'تصميم المراحل', 'الموازنة', 'التوثيق'],
  },
  {
    id: '4',
    name: 'Sara Al-Harbi',
    nameAr: 'سارة الحربي',
    role: '3D Artist',
    roleAr: 'فنانة ثلاثية الأبعاد',
    avatar: '\u{1F3A8}',
    status: 'available',
    currentTask: 'Model new car',
    currentTaskAr: 'نمذجة سيارة جديدة',
    workload: 45,
    email: 'sara@njdgames.com',
    phone: '+966 50 456 7890',
    joinDate: '2023-06-01',
    skills: ['Blender', '3D Modeling', 'Texturing', 'UV Mapping'],
    skillsAr: ['بلندر', 'نمذجة ثلاثية الأبعاد', 'التركيب', 'خرائط UV'],
  },
  {
    id: '5',
    name: 'Omar Al-Zahrani',
    nameAr: 'عمر الزهراني',
    role: 'Sound Engineer',
    roleAr: 'مهندس صوت',
    avatar: '\u{1F3B5}',
    status: 'away',
    currentTask: 'Record engine sounds',
    currentTaskAr: 'تسجيل أصوات المحرك',
    workload: 30,
    email: 'omar@njdgames.com',
    phone: '+966 50 567 8901',
    joinDate: '2023-08-15',
    skills: ['Audio Design', 'FMOD', 'Mixing', 'Recording'],
    skillsAr: ['تصميم الصوت', 'FMOD', 'المكساج', 'التسجيل'],
  },
  {
    id: '6',
    name: 'Layla Al-Qahtani',
    nameAr: 'ليلى القحطاني',
    role: 'QA Engineer',
    roleAr: 'مهندسة ضمان الجودة',
    avatar: '\u{1F50D}',
    status: 'busy',
    currentTask: 'Test multiplayer',
    currentTaskAr: 'اختبار اللعب الجماعي',
    workload: 78,
    email: 'layla@njdgames.com',
    phone: '+966 50 678 9012',
    joinDate: '2023-04-10',
    skills: ['Testing', 'Automation', 'Bug Tracking', 'Performance'],
    skillsAr: ['الاختبار', 'الأتمتة', 'تتبع الأخطاء', 'الأداء'],
  },
];

export const projects: Project[] = [
  {
    id: '1',
    name: 'Hajwala Corsa 2',
    nameAr: 'حجولة كورسا ٢',
    description: 'High-speed drift racing game with realistic Saudi car culture',
    descriptionAr: 'لعبة سباق انجراف عالية السرعة مع ثقافة السيارات السعودية الواقعية',
    progress: 68,
    color: '#7C3AED',
    tasksTotal: 156,
    tasksCompleted: 89,
    status: 'active',
    startDate: '2025-09-01',
    endDate: '2026-06-30',
    teamIds: ['1', '2', '3', '4', '5', '6'],
    tags: ['Racing', 'Multiplayer', 'Mobile'],
    tagsAr: ['سباق', 'جماعي', 'موبايل'],
  },
  {
    id: '2',
    name: 'Desert Legends',
    nameAr: 'أساطير الصحراء',
    description: 'Open-world RPG set in ancient Arabian mythology',
    descriptionAr: 'لعبة آر بي جي في عالم مفتوح مستوحاة من الأساطير العربية القديمة',
    progress: 34,
    color: '#3B82F6',
    tasksTotal: 98,
    tasksCompleted: 33,
    status: 'active',
    startDate: '2025-11-15',
    endDate: '2026-12-31',
    teamIds: ['2', '3', '4', '5'],
    tags: ['RPG', 'Open World', 'Story'],
    tagsAr: ['آر بي جي', 'عالم مفتوح', 'قصة'],
  },
  {
    id: '3',
    name: 'Nimble Ninja',
    nameAr: 'النينجا الرشيق',
    description: 'Fast-paced platformer with procedurally generated levels',
    descriptionAr: 'لعبة منصات سريعة بمراحل مُولّدة إجرائياً',
    progress: 89,
    color: '#10B981',
    tasksTotal: 72,
    tasksCompleted: 64,
    status: 'active',
    startDate: '2025-06-01',
    endDate: '2026-04-15',
    teamIds: ['1', '3', '5', '6'],
    tags: ['Platformer', 'Indie', 'Casual'],
    tagsAr: ['منصات', 'مستقلة', 'عادية'],
  },
];

export const boardColumns: BoardColumn[] = [
  { id: 'todo', titleEn: 'To Do', titleAr: 'قيد الانتظار', color: '#6B7280' },
  { id: 'in-progress', titleEn: 'In Progress', titleAr: 'قيد التنفيذ', color: '#3B82F6' },
  { id: 'review', titleEn: 'Review', titleAr: 'مراجعة', color: '#F59E0B' },
  { id: 'done', titleEn: 'Done', titleAr: 'مكتمل', color: '#10B981' },
];

export const tasks: Task[] = [
  // ── Hajwala Corsa 2 tasks ──
  {
    id: 't1',
    title: 'Fix drift physics engine',
    titleAr: 'إصلاح محرك فيزياء الانجراف',
    description: 'The drift mechanics feel sluggish at high speeds. Need to tune friction coefficients and angular velocity dampening.',
    descriptionAr: 'آليات الانجراف تبدو بطيئة عند السرعات العالية. نحتاج لضبط معاملات الاحتكاك وتخميد السرعة الزاوية.',
    status: 'in-progress',
    priority: 'critical',
    assigneeId: '1',
    projectId: '1',
    tags: ['Physics', 'Gameplay'],
    tagsAr: ['فيزياء', 'أسلوب اللعب'],
    dueDate: '2026-03-20',
    createdAt: '2026-03-10',
    storyPoints: 8,
    sprintId: 's5',
  },
  {
    id: 't2',
    title: 'Design garage UI',
    titleAr: 'تصميم واجهة الكراج',
    description: 'Create the car garage interface where players can customize and upgrade their vehicles.',
    descriptionAr: 'إنشاء واجهة كراج السيارات حيث يمكن للاعبين تخصيص وترقية مركباتهم.',
    status: 'in-progress',
    priority: 'high',
    assigneeId: '2',
    projectId: '1',
    tags: ['UI', 'Design'],
    tagsAr: ['واجهة', 'تصميم'],
    dueDate: '2026-03-22',
    createdAt: '2026-03-08',
    storyPoints: 5,
    sprintId: 's5',
  },
  {
    id: 't3',
    title: 'Balance track difficulty curves',
    titleAr: 'موازنة منحنيات صعوبة المسارات',
    description: 'Adjust difficulty progression across all 12 tracks to ensure smooth learning curve.',
    descriptionAr: 'ضبط تدرج الصعوبة عبر جميع المسارات الـ ١٢ لضمان منحنى تعلم سلس.',
    status: 'review',
    priority: 'high',
    assigneeId: '3',
    projectId: '1',
    tags: ['Game Design', 'Balancing'],
    tagsAr: ['تصميم اللعبة', 'الموازنة'],
    dueDate: '2026-03-18',
    createdAt: '2026-03-05',
    storyPoints: 5,
    sprintId: 's5',
  },
  {
    id: 't4',
    title: 'Model Toyota FJ Cruiser',
    titleAr: 'نمذجة تويوتا FJ كروزر',
    description: 'Create high-poly and low-poly 3D model of Toyota FJ Cruiser with PBR textures.',
    descriptionAr: 'إنشاء نموذج ثلاثي الأبعاد عالي ومنخفض المضلعات لتويوتا FJ كروزر مع خامات PBR.',
    status: 'done',
    priority: 'medium',
    assigneeId: '4',
    projectId: '1',
    tags: ['3D', 'Art'],
    tagsAr: ['ثلاثي الأبعاد', 'فن'],
    dueDate: '2026-03-15',
    createdAt: '2026-03-01',
    storyPoints: 8,
    sprintId: 's5',
  },
  {
    id: 't5',
    title: 'Record engine boost SFX',
    titleAr: 'تسجيل مؤثر صوتي للنيترو',
    description: 'Record and mix nitro boost sound effects for all car tiers.',
    descriptionAr: 'تسجيل ومكساج مؤثرات صوتية للنيترو لجميع فئات السيارات.',
    status: 'todo',
    priority: 'medium',
    assigneeId: '5',
    projectId: '1',
    tags: ['Audio', 'SFX'],
    tagsAr: ['صوت', 'مؤثرات'],
    dueDate: '2026-03-25',
    createdAt: '2026-03-12',
    storyPoints: 3,
    sprintId: 's5',
  },
  {
    id: 't6',
    title: 'Test multiplayer sync',
    titleAr: 'اختبار مزامنة اللعب الجماعي',
    description: 'Test network synchronization across different network conditions and report issues.',
    descriptionAr: 'اختبار مزامنة الشبكة عبر ظروف شبكة مختلفة وتسجيل المشاكل.',
    status: 'in-progress',
    priority: 'critical',
    assigneeId: '6',
    projectId: '1',
    tags: ['QA', 'Multiplayer'],
    tagsAr: ['ضمان الجودة', 'جماعي'],
    dueDate: '2026-03-21',
    createdAt: '2026-03-11',
    storyPoints: 5,
    sprintId: 's5',
  },
  {
    id: 't7',
    title: 'Implement leaderboard API',
    titleAr: 'تطبيق واجهة لوحة المتصدرين',
    description: 'Build RESTful API for global and friends leaderboard with pagination.',
    descriptionAr: 'بناء واجهة برمجة تطبيقات للوحة المتصدرين العالمية والأصدقاء مع التصفح.',
    status: 'todo',
    priority: 'high',
    assigneeId: '1',
    projectId: '1',
    tags: ['Backend', 'API'],
    tagsAr: ['خلفية', 'واجهة برمجة'],
    dueDate: '2026-03-28',
    createdAt: '2026-03-14',
    storyPoints: 8,
    sprintId: 's5',
  },
  {
    id: 't8',
    title: 'Create loading screen animations',
    titleAr: 'إنشاء حركات شاشة التحميل',
    description: 'Design and implement animated loading screens with gameplay tips.',
    descriptionAr: 'تصميم وتطبيق شاشات تحميل متحركة مع نصائح اللعب.',
    status: 'done',
    priority: 'low',
    assigneeId: '2',
    projectId: '1',
    tags: ['UI', 'Animation'],
    tagsAr: ['واجهة', 'رسوم متحركة'],
    dueDate: '2026-03-14',
    createdAt: '2026-03-02',
    storyPoints: 3,
    sprintId: 's5',
  },
  // ── Desert Legends tasks ──
  {
    id: 't9',
    title: 'Design main character concept',
    titleAr: 'تصميم مفهوم الشخصية الرئيسية',
    description: 'Create concept art for the main hero character with cultural references.',
    descriptionAr: 'إنشاء فن مفاهيمي للشخصية البطلة الرئيسية مع مراجع ثقافية.',
    status: 'review',
    priority: 'high',
    assigneeId: '4',
    projectId: '2',
    tags: ['Concept Art', 'Character'],
    tagsAr: ['فن مفاهيمي', 'شخصية'],
    dueDate: '2026-03-19',
    createdAt: '2026-03-06',
    storyPoints: 5,
    sprintId: 's5',
  },
  {
    id: 't10',
    title: 'Write dialog system framework',
    titleAr: 'كتابة إطار نظام الحوار',
    description: 'Implement branching dialog system with Arabic/English support.',
    descriptionAr: 'تطبيق نظام حوار متفرع بدعم العربية والإنجليزية.',
    status: 'in-progress',
    priority: 'high',
    assigneeId: '3',
    projectId: '2',
    tags: ['Narrative', 'System'],
    tagsAr: ['سرد', 'نظام'],
    dueDate: '2026-03-24',
    createdAt: '2026-03-09',
    storyPoints: 8,
    sprintId: 's5',
  },
  {
    id: 't11',
    title: 'Create desert environment tileset',
    titleAr: 'إنشاء مجموعة عناصر بيئة الصحراء',
    description: 'Build reusable desert environment tiles including sand dunes, oasis, and ruins.',
    descriptionAr: 'بناء عناصر بيئة صحراوية قابلة لإعادة الاستخدام تشمل الكثبان والواحات والأطلال.',
    status: 'todo',
    priority: 'medium',
    assigneeId: '4',
    projectId: '2',
    tags: ['3D', 'Environment'],
    tagsAr: ['ثلاثي الأبعاد', 'بيئة'],
    dueDate: '2026-03-30',
    createdAt: '2026-03-13',
    storyPoints: 8,
    sprintId: 's5',
  },
  {
    id: 't12',
    title: 'Compose desert ambient soundtrack',
    titleAr: 'تأليف موسيقى خلفية صحراوية',
    description: 'Create atmospheric desert soundtrack with traditional Arabian instruments.',
    descriptionAr: 'إنشاء موسيقى خلفية صحراوية بآلات عربية تقليدية.',
    status: 'todo',
    priority: 'low',
    assigneeId: '5',
    projectId: '2',
    tags: ['Audio', 'Music'],
    tagsAr: ['صوت', 'موسيقى'],
    dueDate: '2026-04-01',
    createdAt: '2026-03-15',
    storyPoints: 5,
    sprintId: 's6',
  },
  // ── Nimble Ninja tasks ──
  {
    id: 't13',
    title: 'Fix wall jump detection',
    titleAr: 'إصلاح كشف القفز على الجدران',
    description: 'Wall jump raycast is inconsistent on angled surfaces. Fix collision detection.',
    descriptionAr: 'كشف القفز على الجدران غير متسق على الأسطح المائلة. إصلاح كشف التصادم.',
    status: 'done',
    priority: 'critical',
    assigneeId: '1',
    projectId: '3',
    tags: ['Physics', 'Bug'],
    tagsAr: ['فيزياء', 'خلل'],
    dueDate: '2026-03-16',
    createdAt: '2026-03-07',
    storyPoints: 5,
    sprintId: 's5',
  },
  {
    id: 't14',
    title: 'Add procedural level generator',
    titleAr: 'إضافة مولد المراحل الإجرائي',
    description: 'Implement seed-based procedural level generation for infinite mode.',
    descriptionAr: 'تطبيق توليد مراحل إجرائي مبني على البذور لوضع اللانهاية.',
    status: 'done',
    priority: 'high',
    assigneeId: '1',
    projectId: '3',
    tags: ['System', 'Gameplay'],
    tagsAr: ['نظام', 'أسلوب اللعب'],
    dueDate: '2026-03-12',
    createdAt: '2026-02-25',
    storyPoints: 13,
    sprintId: 's4',
  },
  {
    id: 't15',
    title: 'Design achievement badges',
    titleAr: 'تصميم شارات الإنجازات',
    description: 'Create 20 achievement badge icons for various in-game milestones.',
    descriptionAr: 'إنشاء ٢٠ أيقونة شارة إنجاز لمعالم مختلفة داخل اللعبة.',
    status: 'in-progress',
    priority: 'medium',
    assigneeId: '2',
    projectId: '3',
    tags: ['UI', 'Icons'],
    tagsAr: ['واجهة', 'أيقونات'],
    dueDate: '2026-03-23',
    createdAt: '2026-03-10',
    storyPoints: 3,
    sprintId: 's5',
  },
  {
    id: 't16',
    title: 'QA regression test - Level 1-20',
    titleAr: 'اختبار الانحدار - المراحل ١-٢٠',
    description: 'Full regression testing on the first 20 handcrafted levels.',
    descriptionAr: 'اختبار انحدار كامل على أول ٢٠ مرحلة مصممة يدوياً.',
    status: 'review',
    priority: 'high',
    assigneeId: '6',
    projectId: '3',
    tags: ['QA', 'Testing'],
    tagsAr: ['ضمان الجودة', 'اختبار'],
    dueDate: '2026-03-19',
    createdAt: '2026-03-11',
    storyPoints: 5,
    sprintId: 's5',
  },
  {
    id: 't17',
    title: 'Implement daily challenge system',
    titleAr: 'تطبيق نظام التحديات اليومية',
    description: 'Create daily challenge mode with leaderboards and rewards.',
    descriptionAr: 'إنشاء وضع التحديات اليومية مع لوحات المتصدرين والمكافآت.',
    status: 'todo',
    priority: 'medium',
    assigneeId: '3',
    projectId: '3',
    tags: ['Gameplay', 'System'],
    tagsAr: ['أسلوب اللعب', 'نظام'],
    dueDate: '2026-03-27',
    createdAt: '2026-03-14',
    storyPoints: 8,
    sprintId: 's5',
  },
  {
    id: 't18',
    title: 'Optimize particle effects',
    titleAr: 'تحسين تأثيرات الجسيمات',
    description: 'Reduce draw calls from particle systems to improve mobile performance.',
    descriptionAr: 'تقليل استدعاءات الرسم من أنظمة الجسيمات لتحسين أداء الموبايل.',
    status: 'todo',
    priority: 'high',
    assigneeId: '1',
    projectId: '1',
    tags: ['Performance', 'Graphics'],
    tagsAr: ['أداء', 'رسومات'],
    dueDate: '2026-03-26',
    createdAt: '2026-03-13',
    storyPoints: 5,
    sprintId: 's5',
  },
  {
    id: 't19',
    title: 'Design inventory system UI',
    titleAr: 'تصميم واجهة نظام المخزون',
    description: 'Create inventory management screen for Desert Legends RPG.',
    descriptionAr: 'إنشاء شاشة إدارة المخزون للعبة أساطير الصحراء.',
    status: 'todo',
    priority: 'medium',
    assigneeId: '2',
    projectId: '2',
    tags: ['UI', 'Design'],
    tagsAr: ['واجهة', 'تصميم'],
    dueDate: '2026-04-02',
    createdAt: '2026-03-15',
    storyPoints: 5,
    sprintId: 's6',
  },
  {
    id: 't20',
    title: 'Setup CI/CD pipeline',
    titleAr: 'إعداد خط أنابيب CI/CD',
    description: 'Configure automated build and deploy pipeline for all three games.',
    descriptionAr: 'إعداد خط بناء ونشر آلي لجميع الألعاب الثلاث.',
    status: 'done',
    priority: 'high',
    assigneeId: '1',
    projectId: '1',
    tags: ['DevOps', 'Infrastructure'],
    tagsAr: ['عمليات التطوير', 'البنية التحتية'],
    dueDate: '2026-03-10',
    createdAt: '2026-02-28',
    storyPoints: 5,
    sprintId: 's4',
  },
];

export const designItems: DesignItem[] = [
  {
    id: 'd1',
    title: 'Garage UI Mockup',
    titleAr: 'نموذج واجهة الكراج',
    type: 'ui',
    status: 'in-review',
    assigneeId: '2',
    projectId: '1',
    thumbnail: '\u{1F3CE}\u{FE0F}',
    createdAt: '2026-03-08',
    updatedAt: '2026-03-16',
    version: 3,
    comments: 7,
  },
  {
    id: 'd2',
    title: 'Toyota FJ Cruiser 3D Model',
    titleAr: 'نموذج تويوتا FJ كروزر ثلاثي الأبعاد',
    type: '3d-model',
    status: 'approved',
    assigneeId: '4',
    projectId: '1',
    thumbnail: '\u{1F697}',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-15',
    version: 5,
    comments: 12,
  },
  {
    id: 'd3',
    title: 'Drift Smoke Particle Effect',
    titleAr: 'تأثير جسيمات دخان الانجراف',
    type: 'animation',
    status: 'approved',
    assigneeId: '4',
    projectId: '1',
    thumbnail: '\u{1F4A8}',
    createdAt: '2026-03-05',
    updatedAt: '2026-03-12',
    version: 2,
    comments: 4,
  },
  {
    id: 'd4',
    title: 'Main Hero Concept Art',
    titleAr: 'فن مفاهيمي للبطل الرئيسي',
    type: 'concept-art',
    status: 'in-review',
    assigneeId: '4',
    projectId: '2',
    thumbnail: '\u{2694}\u{FE0F}',
    createdAt: '2026-03-06',
    updatedAt: '2026-03-17',
    version: 4,
    comments: 15,
  },
  {
    id: 'd5',
    title: 'Desert Environment Concepts',
    titleAr: 'مفاهيم بيئة الصحراء',
    type: 'concept-art',
    status: 'approved',
    assigneeId: '4',
    projectId: '2',
    thumbnail: '\u{1F3DC}\u{FE0F}',
    createdAt: '2026-02-28',
    updatedAt: '2026-03-10',
    version: 3,
    comments: 9,
  },
  {
    id: 'd6',
    title: 'Inventory UI Wireframes',
    titleAr: 'إطارات سلكية لواجهة المخزون',
    type: 'ui',
    status: 'draft',
    assigneeId: '2',
    projectId: '2',
    thumbnail: '\u{1F4E6}',
    createdAt: '2026-03-15',
    updatedAt: '2026-03-15',
    version: 1,
    comments: 0,
  },
  {
    id: 'd7',
    title: 'Ninja Character Sprites',
    titleAr: 'رسومات شخصية النينجا',
    type: 'animation',
    status: 'approved',
    assigneeId: '2',
    projectId: '3',
    thumbnail: '\u{1F977}',
    createdAt: '2026-02-20',
    updatedAt: '2026-03-08',
    version: 6,
    comments: 18,
  },
  {
    id: 'd8',
    title: 'Achievement Badge Icons',
    titleAr: 'أيقونات شارات الإنجاز',
    type: 'icon',
    status: 'in-review',
    assigneeId: '2',
    projectId: '3',
    thumbnail: '\u{1F3C6}',
    createdAt: '2026-03-10',
    updatedAt: '2026-03-16',
    version: 2,
    comments: 5,
  },
  {
    id: 'd9',
    title: 'Loading Screen Artwork',
    titleAr: 'أعمال فنية لشاشة التحميل',
    type: 'concept-art',
    status: 'approved',
    assigneeId: '2',
    projectId: '1',
    thumbnail: '\u{1F5BC}\u{FE0F}',
    createdAt: '2026-03-02',
    updatedAt: '2026-03-14',
    version: 2,
    comments: 3,
  },
  {
    id: 'd10',
    title: 'Sand Dune Texture Pack',
    titleAr: 'حزمة خامات الكثبان الرملية',
    type: 'texture',
    status: 'draft',
    assigneeId: '4',
    projectId: '2',
    thumbnail: '\u{1F3D6}\u{FE0F}',
    createdAt: '2026-03-14',
    updatedAt: '2026-03-14',
    version: 1,
    comments: 0,
  },
  {
    id: 'd11',
    title: 'Car Selection Screen UI',
    titleAr: 'واجهة شاشة اختيار السيارة',
    type: 'ui',
    status: 'revision',
    assigneeId: '2',
    projectId: '1',
    thumbnail: '\u{1F3CE}\u{FE0F}',
    createdAt: '2026-03-04',
    updatedAt: '2026-03-16',
    version: 4,
    comments: 11,
  },
  {
    id: 'd12',
    title: 'Oasis Ruins 3D Environment',
    titleAr: 'بيئة أطلال الواحة ثلاثية الأبعاد',
    type: '3d-model',
    status: 'in-review',
    assigneeId: '4',
    projectId: '2',
    thumbnail: '\u{1F3DB}\u{FE0F}',
    createdAt: '2026-03-09',
    updatedAt: '2026-03-17',
    version: 2,
    comments: 6,
  },
];

export const sprints: Sprint[] = [
  {
    id: 's3',
    name: 'Sprint 3',
    nameAr: 'السبرينت ٣',
    status: 'completed',
    startDate: '2026-02-03',
    endDate: '2026-02-16',
    goals: [
      'Complete core game loop for Nimble Ninja',
      'Finalize car physics model',
      'Setup project infrastructure',
    ],
    goalsAr: [
      'إكمال حلقة اللعب الأساسية للنينجا الرشيق',
      'إنهاء نموذج فيزياء السيارات',
      'إعداد البنية التحتية للمشروع',
    ],
    taskIds: [],
    velocity: 42,
    totalPoints: 42,
    completedPoints: 42,
  },
  {
    id: 's4',
    name: 'Sprint 4',
    nameAr: 'السبرينت ٤',
    status: 'completed',
    startDate: '2026-02-17',
    endDate: '2026-03-02',
    goals: [
      'Implement procedural level generation',
      'Complete CI/CD pipeline',
      'Start Desert Legends pre-production',
    ],
    goalsAr: [
      'تطبيق توليد المراحل الإجرائي',
      'إكمال خط أنابيب CI/CD',
      'بدء مرحلة ما قبل الإنتاج لأساطير الصحراء',
    ],
    taskIds: ['t14', 't20'],
    velocity: 38,
    totalPoints: 40,
    completedPoints: 38,
  },
  {
    id: 's5',
    name: 'Sprint 5',
    nameAr: 'السبرينت ٥',
    status: 'active',
    startDate: '2026-03-03',
    endDate: '2026-03-16',
    goals: [
      'Fix drift physics and multiplayer sync',
      'Complete Hajwala Corsa 2 garage UI',
      'Desert Legends character concept finalization',
      'Nimble Ninja level 1-20 QA pass',
    ],
    goalsAr: [
      'إصلاح فيزياء الانجراف ومزامنة اللعب الجماعي',
      'إكمال واجهة كراج حجولة كورسا ٢',
      'إنهاء مفهوم شخصية أساطير الصحراء',
      'اختبار جودة المراحل ١-٢٠ للنينجا الرشيق',
    ],
    taskIds: ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11', 't13', 't15', 't16', 't17', 't18'],
    velocity: 0,
    totalPoints: 89,
    completedPoints: 31,
  },
  {
    id: 's6',
    name: 'Sprint 6',
    nameAr: 'السبرينت ٦',
    status: 'planning',
    startDate: '2026-03-17',
    endDate: '2026-03-30',
    goals: [
      'Launch Nimble Ninja beta',
      'Complete Desert Legends environment art',
      'Hajwala Corsa 2 leaderboard integration',
    ],
    goalsAr: [
      'إطلاق النسخة التجريبية للنينجا الرشيق',
      'إكمال فن بيئة أساطير الصحراء',
      'دمج لوحة المتصدرين لحجولة كورسا ٢',
    ],
    taskIds: ['t12', 't19'],
    velocity: 0,
    totalPoints: 10,
    completedPoints: 0,
  },
];

export const activities: Activity[] = [
  {
    id: '1',
    user: teamMembers[0],
    action: 'completed task',
    actionAr: 'أكمل مهمة',
    target: 'Fix drift physics engine',
    targetAr: 'إصلاح محرك فيزياء الانجراف',
    time: '5 min ago',
    timeAr: 'منذ ٥ دقائق',
  },
  {
    id: '2',
    user: teamMembers[1],
    action: 'created task',
    actionAr: 'أنشأت مهمة',
    target: 'Design garage UI',
    targetAr: 'تصميم واجهة الكراج',
    time: '12 min ago',
    timeAr: 'منذ ١٢ دقيقة',
  },
  {
    id: '3',
    user: teamMembers[2],
    action: 'moved task to Review',
    actionAr: 'نقل مهمة إلى المراجعة',
    target: 'Track selection flow',
    targetAr: 'تدفق اختيار المسار',
    time: '30 min ago',
    timeAr: 'منذ ٣٠ دقيقة',
  },
  {
    id: '4',
    user: teamMembers[3],
    action: 'completed task',
    actionAr: 'أكملت مهمة',
    target: 'Model Toyota FJ Cruiser',
    targetAr: 'نمذجة تويوتا FJ كروزر',
    time: '1h ago',
    timeAr: 'منذ ساعة',
  },
  {
    id: '5',
    user: teamMembers[5],
    action: 'commented on',
    actionAr: 'علقت على',
    target: 'Multiplayer sync issues',
    targetAr: 'مشاكل مزامنة اللعب الجماعي',
    time: '2h ago',
    timeAr: 'منذ ساعتين',
  },
  {
    id: '6',
    user: teamMembers[4],
    action: 'created task',
    actionAr: 'أنشأ مهمة',
    target: 'Record nitro boost SFX',
    targetAr: 'تسجيل مؤثر صوتي للنيترو',
    time: '3h ago',
    timeAr: 'منذ ٣ ساعات',
  },
];

export const kpis: KPI[] = [
  {
    labelEn: 'Total Tasks',
    labelAr: 'إجمالي المهام',
    value: 156,
    change: 12,
    color: '#7C3AED',
    icon: 'clipboard',
  },
  {
    labelEn: 'Completed',
    labelAr: 'مكتملة',
    value: 89,
    change: 8,
    color: '#10B981',
    icon: 'check-circle',
  },
  {
    labelEn: 'In Progress',
    labelAr: 'قيد التنفيذ',
    value: 42,
    change: -3,
    color: '#3B82F6',
    icon: 'timer',
  },
  {
    labelEn: 'Overdue',
    labelAr: 'متأخرة',
    value: 12,
    change: 2,
    color: '#EF4444',
    icon: 'alert-triangle',
  },
];

export const sprintInfo = {
  nameEn: 'Sprint 5',
  nameAr: 'السبرينت ٥',
  teamName: 'NJD Games',
};

// ── Helpers ────────────────────────────────────────────

export function getTeamMember(id: string): TeamMember | undefined {
  return teamMembers.find((m) => m.id === id);
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getTasksByStatus(status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status);
}

export function getTasksByProject(projectId: string): Task[] {
  return tasks.filter((t) => t.projectId === projectId);
}

export function getTasksBySprint(sprintId: string): Task[] {
  return tasks.filter((t) => t.sprintId === sprintId);
}

export function getDesignItemsByProject(projectId: string): DesignItem[] {
  return designItems.filter((d) => d.projectId === projectId);
}

export function getProjectTeam(project: Project): TeamMember[] {
  return project.teamIds.map((id) => getTeamMember(id)).filter(Boolean) as TeamMember[];
}
