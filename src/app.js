// Supabase configuration
// 1. Verify these credentials in Supabase Dashboard > Settings > API
const SUPABASE_URL = 'https://qikfgxpbqjzmkjjcxgfr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpa2ZneHBicWp6bWtqamN4Z2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDYzMjUsImV4cCI6MjA4NDQyMjMyNX0.DkvmYMIEfF1GEIyd7s7v1VL0o7Y2h7OIv4ShhgVrQ60';

let supabaseClient;
try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.startsWith('eyJ')) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.warn("Supabase configuration incomplete or invalid key format. Using mock/local data.");
    }
} catch (e) {
    console.error("Supabase library failed to initialize:", e);
}

// Auth Elements
const authScreen = document.getElementById('authScreen');
const authForm = document.getElementById('authForm');
const authEmail = document.getElementById('email');
const authPassword = document.getElementById('password');
const authError = document.getElementById('authError');
const appContent = document.getElementById('appContent');
const logoutBtn = document.getElementById('logoutBtn');

const gridView = document.getElementById('gridView');
const timelineView = document.getElementById('timelineView');
const viewToggle = document.getElementById('viewToggle');
const viewIcon = document.getElementById('viewIcon');
const currentDateEl = document.getElementById('currentDate');
const viewTitle = document.getElementById('viewTitle');

// Modal Elements
const modalOverlay = document.getElementById('modalOverlay');
const newEventModal = document.getElementById('newEventModal');
const moreInfoModal = document.getElementById('moreInfoModal');
const quickNotesModal = document.getElementById('quickNotesModal');
const manageCategoriesModal = document.getElementById('manageCategoriesModal');
const addEventBtn = document.getElementById('addEvent');
const cancelEventBtn = document.getElementById('cancelEvent');
const saveEventBtn = document.getElementById('saveEvent');
const addMoreInfoBtn = document.getElementById('addMoreInfo');
const closeMoreInfoBtn = document.getElementById('closeMoreInfo');
const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
const closeManageCategoriesBtn = document.getElementById('closeManageCategories');

// Quick Notes Elements
const quickNotesInput = document.getElementById('quickNotesInput');
const saveQuickNotesBtn = document.getElementById('saveQuickNotes');
const cancelQuickNotesBtn = document.getElementById('cancelQuickNotes');

// Context Menu Elements
const contextMenu = document.getElementById('contextMenu');
const menuEdit = document.getElementById('menuEdit');
const menuDelete = document.getElementById('menuDelete');
const menuDuplicate = document.getElementById('menuDuplicate');
const menuNotes = document.getElementById('menuNotes');
const menuStar = document.getElementById('menuStar');
const starLabel = document.getElementById('starLabel');
const menuUpdateIcon = document.getElementById('menuUpdateIcon');

// Form Inputs
const eventTitleInput = document.getElementById('eventTitle');
const eventNotesInput = document.getElementById('eventNotes');
const eventDateInput = document.getElementById('eventDateInput');
const eventTagsInput = document.getElementById('eventTags');
const eventStarredInput = document.getElementById('eventStarred');
const eventUrlInput = document.getElementById('eventUrl');
const eventMultiDayInput = document.getElementById('eventMultiDay');
const modalCategoryTabs = document.getElementById('modalCategoryTabs');
const emojiPickerContainer = document.getElementById('emojiPickerContainer');
const emojiPicker = document.getElementById('emojiPicker');
const selectedIconDisplay = document.getElementById('selectedIconDisplay');
const currentEmojiDisplay = document.getElementById('currentEmoji');
const emojiSearch = document.getElementById('emojiSearch');
const emojiList = document.getElementById('emojiList');

// Category Management Inputs
const newCategoryEmojiBtn = document.getElementById('newCategoryEmoji');
const newCategoryNameInput = document.getElementById('newCategoryName');
const saveNewCategoryBtn = document.getElementById('saveNewCategory');
const categoriesListEl = document.getElementById('categoriesList');
const categoryFilterBar = document.getElementById('categoryFilterBar');

// Expanded Emoji Library
const COMMON_EMOJIS = [
    { char: '🎉', keywords: 'party, celebrate, event, general, confetti', category: 'Celebration' },
    { char: '🎂', keywords: 'birthday, cake, celebrate, age', category: 'Celebration' },
    { char: '💍', keywords: 'anniversary, wedding, ring, love, marriage, proposal, engagement', category: 'Celebration' },
    { char: '🎊', keywords: 'party, celebration, ball', category: 'Celebration' },
    { char: '🎈', keywords: 'balloon, party, celebrate', category: 'Celebration' },
    { char: '🎆', keywords: 'fireworks, celebrate, new year', category: 'Celebration' },
    { char: '🎇', keywords: 'sparkler, celebrate', category: 'Celebration' },
    { char: '🥂', keywords: 'cheers, celebrate, drink, toast, champagne', category: 'Celebration' },
    { char: '🍾', keywords: 'bottle, bubbly, drink', category: 'Celebration' },
    { char: '🍰', keywords: 'cake, food, celebrate, dessert', category: 'Celebration' },
    { char: '🧁', keywords: 'cupcake, food, dessert', category: 'Celebration' },
    { char: '🎁', keywords: 'gift, present, christmas, birthday', category: 'Celebration' },
    { char: '🧧', keywords: 'red envelope, money, luck', category: 'Celebration' },
    { char: '🥳', keywords: 'party face, celebrate, happy', category: 'Celebration' },
    { char: '🕯️', keywords: 'candle', category: 'Celebration' },
    { char: '🏮', keywords: 'red lantern', category: 'Celebration' },
    { char: '🎋', keywords: 'tanabata tree', category: 'Celebration' },
    { char: '🎍', keywords: 'pine decoration', category: 'Celebration' },
    { char: '🎎', keywords: 'japanese dolls', category: 'Celebration' },
    { char: '🎏', keywords: 'carp streamer', category: 'Celebration' },
    { char: '🎐', keywords: 'wind chime', category: 'Celebration' },
    { char: '🎑', keywords: 'moon viewing ceremony', category: 'Celebration' },
    { char: '🎟️', keywords: 'admission tickets', category: 'Celebration' },
    { char: '🎫', keywords: 'ticket', category: 'Celebration' },
    { char: '🎖️', keywords: 'military medal', category: 'Celebration' },
    { char: '🏆', keywords: 'trophy', category: 'Celebration' },
    { char: '🏅', keywords: 'sports medal', category: 'Celebration' },
    { char: '🥇', keywords: '1st place medal', category: 'Celebration' },
    { char: '🥈', keywords: '2nd place medal', category: 'Celebration' },
    { char: '🥉', keywords: '3rd place medal', category: 'Celebration' },
    { char: '🪄', keywords: 'magic wand', category: 'Celebration' },
    { char: '✈️', keywords: 'trip, travel, flight, plane, vacation', category: 'Travel' },
    { char: '🛫', keywords: 'departure, takeoff, flight', category: 'Travel' },
    { char: '🛬', keywords: 'arrival, landing, flight', category: 'Travel' },
    { char: '🏖️', keywords: 'beach, vacation, summer, holiday, sand', category: 'Travel' },
    { char: '🏝️', keywords: 'island, vacation, tropical', category: 'Travel' },
    { char: '🏔️', keywords: 'mountain, snow, hiking, trip', category: 'Travel' },
    { char: '🏕️', keywords: 'camping, tent, outdoors', category: 'Travel' },
    { char: '🏠', keywords: 'home, house, move, address', category: 'Travel' },
    { char: '🏢', keywords: 'office, work, building', category: 'Travel' },
    { char: '🚗', keywords: 'car, drive, trip, road', category: 'Travel' },
    { char: '🚂', keywords: 'train, trip, travel', category: 'Travel' },
    { char: '🛳️', keywords: 'cruise, ship, boat, vacation', category: 'Travel' },
    { char: '🌍', keywords: 'world, earth, global, travel', category: 'Travel' },
    { char: '🗽', keywords: 'statue, nyc, travel', category: 'Travel' },
    { char: '🗼', keywords: 'tokyo, paris, tower', category: 'Travel' },
    { char: '🎡', keywords: 'ferris wheel, park, fair', category: 'Travel' },
    { char: '🎢', keywords: 'roller coaster, park', category: 'Travel' },
    { char: '🏨', keywords: 'hotel, travel, stay', category: 'Travel' },
    { char: '🌋', keywords: 'volcano, nature', category: 'Travel' },
    { char: '🗺️', keywords: 'map, travel, plan', category: 'Travel' },
    { char: '🚲', keywords: 'bike, travel, cycle', category: 'Travel' },
    { char: '🚕', keywords: 'taxi, car, city', category: 'Travel' },
    { char: '🎒', keywords: 'backpack, travel, hiking', category: 'Travel' },
    { char: '✏️', keywords: 'exam, study, school, test, write', category: 'Education' },
    { char: '🎓', keywords: 'graduation, school, education, degree', category: 'Education' },
    { char: '📚', keywords: 'books, study, read, school', category: 'Education' },
    { char: '📝', keywords: 'notes, writing, test', category: 'Education' },
    { char: '🏫', keywords: 'school, university', category: 'Education' },
    { char: '🍎', keywords: 'apple, teacher, school', category: 'Education' },
    { char: '🧠', keywords: 'brain, study, thinking', category: 'Education' },
    { char: '📐', keywords: 'ruler, math, school', category: 'Education' },
    { char: '🧪', keywords: 'science, lab, experiment', category: 'Education' },
    { char: '🔬', keywords: 'microscope, science', category: 'Education' },
    { char: '🔭', keywords: 'telescope, space, science', category: 'Education' },
    { char: '💻', keywords: 'computer, work, tech, laptop', category: 'Work' },
    { char: '💼', keywords: 'work, business, job, briefcase', category: 'Work' },
    { char: '🖥️', keywords: 'desktop, work, computer', category: 'Work' },
    { char: '📊', keywords: 'chart, work, presentation', category: 'Work' },
    { char: '🖋️', keywords: 'pen, write, work', category: 'Work' },
    { char: '📅', keywords: 'calendar, date, schedule, work', category: 'Work' },
    { char: '📎', keywords: 'clip, office, work', category: 'Work' },
    { char: '🖇️', keywords: 'clips, office', category: 'Work' },
    { char: '⚽', keywords: 'soccer ball', category: 'Sports' },
    { char: '⚾', keywords: 'baseball', category: 'Sports' },
    { char: '🥎', keywords: 'softball', category: 'Sports' },
    { char: '🏀', keywords: 'basketball', category: 'Sports' },
    { char: '🏐', keywords: 'volleyball', category: 'Sports' },
    { char: '🏈', keywords: 'american football', category: 'Sports' },
    { char: '🏉', keywords: 'rugby football', category: 'Sports' },
    { char: '🎾', keywords: 'tennis', category: 'Sports' },
    { char: '🥏', keywords: 'flying disc', category: 'Sports' },
    { char: '🎳', keywords: 'bowling', category: 'Sports' },
    { char: '🏏', keywords: 'cricket game', category: 'Sports' },
    { char: '🏑', keywords: 'field hockey', category: 'Sports' },
    { char: '🏒', keywords: 'ice hockey', category: 'Sports' },
    { char: '🥍', keywords: 'lacrosse', category: 'Sports' },
    { char: '🏓', keywords: 'ping pong', category: 'Sports' },
    { char: '🏸', keywords: 'badminton', category: 'Sports' },
    { char: '🥊', keywords: 'boxing glove', category: 'Sports' },
    { char: '🥋', keywords: 'martial arts uniform', category: 'Sports' },
    { char: '🥅', keywords: 'goal net', category: 'Sports' },
    { char: '⛳', keywords: 'flag in hole', category: 'Sports' },
    { char: '⛸️', keywords: 'ice skate', category: 'Sports' },
    { char: '🎣', keywords: 'fishing pole', category: 'Sports' },
    { char: '🤿', keywords: 'diving mask', category: 'Sports' },
    { char: '🎽', keywords: 'running shirt', category: 'Sports' },
    { char: '🎿', keywords: 'skis', category: 'Sports' },
    { char: '🛷', keywords: 'sled', category: 'Sports' },
    { char: '🥌', keywords: 'curling stone', category: 'Sports' },
    { char: '🎯', keywords: 'bullseye', category: 'Sports' },
    { char: '🏁', keywords: 'race, finish, end, start', category: 'Sports' },
    { char: '🏃', keywords: 'run, race, fitness, sports, exercise', category: 'Sports' },
    { char: '🚴', keywords: 'bike, cycle, fitness, sports', category: 'Sports' },
    { char: '🏋️', keywords: 'weight, gym, lifting', category: 'Sports' },
    { char: '🧘', keywords: 'yoga, zen, meditation', category: 'Sports' },
    { char: '🏌️', keywords: 'golf, sports', category: 'Sports' },
    { char: '🏄', keywords: 'surf, water, sports', category: 'Sports' },
    { char: '🏊', keywords: 'swim, water, sports', category: 'Sports' },
    { char: '🛹', keywords: 'skateboard, fun', category: 'Sports' },
    { char: '🏥', keywords: 'hospital, health, doctor, medical', category: 'Health' },
    { char: '💊', keywords: 'pill, medicine, health', category: 'Health' },
    { char: '💉', keywords: 'injection, vaccine, health', category: 'Health' },
    { char: '🦷', keywords: 'dentist, tooth, health', category: 'Health' },
    { char: '🩺', keywords: 'stethoscope, doctor, health', category: 'Health' },
    { char: '🩹', keywords: 'bandage, health', category: 'Health' },
    { char: '🩸', keywords: 'blood, health', category: 'Health' },
    { char: '🧬', keywords: 'dna, health, science', category: 'Health' },
    { char: '🍼', keywords: 'baby, bottle, new', category: 'Life' },
    { char: '👶', keywords: 'baby, child, born', category: 'Life' },
    { char: '🤰', keywords: 'pregnant, pregnancy, baby', category: 'Life' },
    { char: '🤱', keywords: 'breastfeeding, baby', category: 'Life' },
    { char: '🛌', keywords: 'sleep, rest', category: 'Life' },
    { char: '🧼', keywords: 'soap, clean', category: 'Life' },
    { char: '🍕', keywords: 'pizza, food, party', category: 'Food' },
    { char: '🍔', keywords: 'burger, food', category: 'Food' },
    { char: '🌮', keywords: 'taco, food', category: 'Food' },
    { char: '🍣', keywords: 'sushi, food', category: 'Food' },
    { char: '🍜', keywords: 'ramen, food', category: 'Food' },
    { char: '🍦', keywords: 'ice cream, dessert', category: 'Food' },
    { char: '🍩', keywords: 'donut, dessert', category: 'Food' },
    { char: '☕', keywords: 'coffee, morning, tea', category: 'Food' },
    { char: '🍺', keywords: 'beer, drink, party', category: 'Food' },
    { char: '🍷', keywords: 'wine, drink, dinner', category: 'Food' },
    { char: '🍸', keywords: 'cocktail, drink', category: 'Food' },
    { char: '🥪', keywords: 'sandwich, food', category: 'Food' },
    { char: '🥗', keywords: 'salad, food, healthy', category: 'Food' },
    { char: '🥞', keywords: 'pancakes, breakfast', category: 'Food' },
    { char: '🍳', keywords: 'egg, breakfast', category: 'Food' },
    { char: '🥐', keywords: 'croissant, bread', category: 'Food' },
    { char: '🥯', keywords: 'bagel, bread', category: 'Food' },
    { char: '🥨', keywords: 'pretzel, snack', category: 'Food' },
    { char: '🥖', keywords: 'baguette, bread', category: 'Food' },
    { char: '🧀', keywords: 'cheese, food', category: 'Food' },
    { char: '🥚', keywords: 'egg, food', category: 'Food' },
    { char: '🥓', keywords: 'bacon, breakfast', category: 'Food' },
    { char: '🥩', keywords: 'steak, meat', category: 'Food' },
    { char: '🍗', keywords: 'poultry, chicken', category: 'Food' },
    { char: '🍖', keywords: 'meat on bone', category: 'Food' },
    { char: '🌭', keywords: 'hot dog', category: 'Food' },
    { char: '🍟', keywords: 'french fries', category: 'Food' },
    { char: '🍿', keywords: 'popcorn, movie', category: 'Food' },
    { char: '🧈', keywords: 'butter', category: 'Food' },
    { char: '🧂', keywords: 'salt', category: 'Food' },
    { char: '🥫', keywords: 'canned food', category: 'Food' },
    { char: '🍱', keywords: 'bento box', category: 'Food' },
    { char: '🍘', keywords: 'rice cracker', category: 'Food' },
    { char: '🍙', keywords: 'rice ball', category: 'Food' },
    { char: '🍚', keywords: 'cooked rice', category: 'Food' },
    { char: '🍛', keywords: 'curry rice', category: 'Food' },
    { char: '🍢', keywords: 'oden', category: 'Food' },
    { char: '🍡', keywords: 'dango', category: 'Food' },
    { char: '🍧', keywords: 'shaved ice', category: 'Food' },
    { char: '🍨', keywords: 'ice cream', category: 'Food' },
    { char: '🥧', keywords: 'pie', category: 'Food' },
    { char: '🍫', keywords: 'chocolate bar', category: 'Food' },
    { char: '🍬', keywords: 'candy', category: 'Food' },
    { char: '🍭', keywords: 'lollipop', category: 'Food' },
    { char: '🍮', keywords: 'custard', category: 'Food' },
    { char: '🍯', keywords: 'honey pot', category: 'Food' },
    { char: '🧃', keywords: 'beverage box', category: 'Food' },
    { char: '🥤', keywords: 'cup with straw', category: 'Food' },
    { char: '🧋', keywords: 'bubble tea', category: 'Food' },
    { char: '🧉', keywords: 'mate', category: 'Food' },
    { char: '🧊', keywords: 'ice cube', category: 'Food' },
    { char: '🥢', keywords: 'chopsticks', category: 'Food' },
    { char: '🍽️', keywords: 'fork and knife with plate', category: 'Food' },
    { char: '🍴', keywords: 'fork and knife', category: 'Food' },
    { char: '🥄', keywords: 'spoon', category: 'Food' },
    { char: '🌸', keywords: 'flower, spring, cherry blossom', category: 'Nature' },
    { char: '💮', keywords: 'white flower', category: 'Nature' },
    { char: '🏵️', keywords: 'rosette', category: 'Nature' },
    { char: '🌹', keywords: 'rose, flower', category: 'Nature' },
    { char: '🥀', keywords: 'wilted flower', category: 'Nature' },
    { char: '🌺', keywords: 'hibiscus, flower', category: 'Nature' },
    { char: '🌻', keywords: 'sunflower, summer', category: 'Nature' },
    { char: '🌼', keywords: 'blossom, flower', category: 'Nature' },
    { char: '🌷', keywords: 'tulip, flower', category: 'Nature' },
    { char: '🌱', keywords: 'seedling', category: 'Nature' },
    { char: '🪴', keywords: 'potted plant', category: 'Nature' },
    { char: '🌲', keywords: 'evergreen tree', category: 'Nature' },
    { char: '🌳', keywords: 'deciduous tree', category: 'Nature' },
    { char: '🌴', keywords: 'palm tree', category: 'Nature' },
    { char: '🌵', keywords: 'cactus', category: 'Nature' },
    { char: '🌾', keywords: 'sheaf of rice', category: 'Nature' },
    { char: '🌿', keywords: 'herb', category: 'Nature' },
    { char: '☘️', keywords: 'shamrock', category: 'Nature' },
    { char: '🍀', keywords: 'four leaf clover', category: 'Nature' },
    { char: '🍁', keywords: 'maple leaf, autumn', category: 'Nature' },
    { char: '🍂', keywords: 'fallen leaf, autumn', category: 'Nature' },
    { char: '🍃', keywords: 'leaf fluttering in wind', category: 'Nature' },
    { char: '🍄', keywords: 'mushroom', category: 'Nature' },
    { char: '🐚', keywords: 'spiral shell', category: 'Nature' },
    { char: '☀️', keywords: 'sun, sunny, day, hot, weather', category: 'Nature' },
    { char: '⭐', keywords: 'star', category: 'Nature' },
    { char: '🌟', keywords: 'glowing star', category: 'Nature' },
    { char: '🌠', keywords: 'shooting star', category: 'Nature' },
    { char: '🌌', keywords: 'milky way', category: 'Nature' },
    { char: '🔥', keywords: 'fire', category: 'Nature' },
    { char: '💧', keywords: 'droplet', category: 'Nature' },
    { char: '🌊', keywords: 'water wave', category: 'Nature' },
    { char: '🪐', keywords: 'saturn, planet, space', category: 'Nature' },
    { char: '🐶', keywords: 'dog face', category: 'Animals' },
    { char: '🐱', keywords: 'cat, pet, animal', category: 'Animals' },
    { char: '🐰', keywords: 'rabbit, bunny, pet', category: 'Animals' },
    { char: '🐴', keywords: 'horse, animal', category: 'Animals' },
    { char: '🦄', keywords: 'unicorn, magic', category: 'Animals' },
    { char: '🐻', keywords: 'bear, animal', category: 'Animals' },
    { char: '🐼', keywords: 'panda, animal', category: 'Animals' },
    { char: '🐨', keywords: 'koala, animal', category: 'Animals' },
    { char: '🦁', keywords: 'lion, animal', category: 'Animals' },
    { char: '🐯', keywords: 'tiger, animal', category: 'Animals' },
    { char: '🐮', keywords: 'cow, animal', category: 'Animals' },
    { char: '🐷', keywords: 'pig, animal', category: 'Animals' },
    { char: '🐗', keywords: 'boar', category: 'Animals' },
    { char: '🐭', keywords: 'mouse', category: 'Animals' },
    { char: '🐹', keywords: 'hamster', category: 'Animals' },
    { char: '🦊', keywords: 'fox', category: 'Animals' },
    { char: '🐽', keywords: 'pig nose', category: 'Animals' },
    { char: '🐸', keywords: 'frog face', category: 'Animals' },
    { char: '🐵', keywords: 'monkey face', category: 'Animals' },
    { char: '🙈', keywords: 'see-no-evil monkey', category: 'Animals' },
    { char: '🙉', keywords: 'hear-no-evil monkey', category: 'Animals' },
    { char: '🙊', keywords: 'speak-no-evil monkey', category: 'Animals' },
    { char: '🐒', keywords: 'monkey', category: 'Animals' },
    { char: '🐔', keywords: 'chicken', category: 'Animals' },
    { char: '🐧', keywords: 'penguin', category: 'Animals' },
    { char: '🐦', keywords: 'bird', category: 'Animals' },
    { char: '🐤', keywords: 'baby chick', category: 'Animals' },
    { char: '🐣', keywords: 'hatching chick', category: 'Animals' },
    { char: '🐥', keywords: 'front-facing baby chick', category: 'Animals' },
    { char: '🦆', keywords: 'duck', category: 'Animals' },
    { char: '🦅', keywords: 'eagle', category: 'Animals' },
    { char: '🦉', keywords: 'owl', category: 'Animals' },
    { char: '🦇', keywords: 'bat', category: 'Animals' },
    { char: '🐺', keywords: 'wolf', category: 'Animals' },
    { char: '🐝', keywords: 'honeybee', category: 'Animals' },
    { char: '🐛', keywords: 'bug', category: 'Animals' },
    { char: '🦋', keywords: 'butterfly', category: 'Animals' },
    { char: '🐌', keywords: 'snail', category: 'Animals' },
    { char: '🐞', keywords: 'lady beetle', category: 'Animals' },
    { char: '🐜', keywords: 'ant', category: 'Animals' },
    { char: '🦗', keywords: 'cricket', category: 'Animals' },
    { char: '🕷️', keywords: 'spider', category: 'Animals' },
    { char: '🕸️', keywords: 'spider web', category: 'Animals' },
    { char: '🦂', keywords: 'scorpion', category: 'Animals' },
    { char: '🦟', keywords: 'mosquito', category: 'Animals' },
    { char: '🦠', keywords: 'microbe', category: 'Animals' },
    { char: '🐢', keywords: 'turtle', category: 'Animals' },
    { char: '🐍', keywords: 'snake', category: 'Animals' },
    { char: '🦎', keywords: 'lizard', category: 'Animals' },
    { char: '🦖', keywords: 't-rex', category: 'Animals' },
    { char: '🦕', keywords: 'sauropod', category: 'Animals' },
    { char: '🐙', keywords: 'octopus', category: 'Animals' },
    { char: '🦑', keywords: 'squid', category: 'Animals' },
    { char: '🦐', keywords: 'shrimp', category: 'Animals' },
    { char: '🦞', keywords: 'lobster', category: 'Animals' },
    { char: '🦀', keywords: 'crab', category: 'Animals' },
    { char: '🐡', keywords: 'blowfish', category: 'Animals' },
    { char: '🐠', keywords: 'tropical fish', category: 'Animals' },
    { char: '🐟', keywords: 'fish', category: 'Animals' },
    { char: '🐬', keywords: 'dolphin', category: 'Animals' },
    { char: '🐳', keywords: 'spouting whale', category: 'Animals' },
    { char: '🐋', keywords: 'whale', category: 'Animals' },
    { char: '🦈', keywords: 'shark', category: 'Animals' },
    { char: '🐊', keywords: 'crocodile', category: 'Animals' },
    { char: '🐅', keywords: 'tiger', category: 'Animals' },
    { char: '🐆', keywords: 'leopard', category: 'Animals' },
    { char: '🦓', keywords: 'zebra', category: 'Animals' },
    { char: '🦍', keywords: 'gorilla', category: 'Animals' },
    { char: '🦧', keywords: 'orangutan', category: 'Animals' },
    { char: '🐘', keywords: 'elephant', category: 'Animals' },
    { char: '🦛', keywords: 'hippopotamus', category: 'Animals' },
    { char: '🦏', keywords: 'rhinoceros', category: 'Animals' },
    { char: '🐪', keywords: 'camel', category: 'Animals' },
    { char: '🐫', keywords: 'two-hump camel', category: 'Animals' },
    { char: '🦒', keywords: 'giraffe', category: 'Animals' },
    { char: '🦘', keywords: 'kangaroo', category: 'Animals' },
    { char: '🦬', keywords: 'bison', category: 'Animals' },
    { char: '🐃', keywords: 'water buffalo', category: 'Animals' },
    { char: '🐂', keywords: 'ox', category: 'Animals' },
    { char: '🐄', keywords: 'cow', category: 'Animals' },
    { char: '🐎', keywords: 'horse', category: 'Animals' },
    { char: '🐖', keywords: 'pig', category: 'Animals' },
    { char: '🐏', keywords: 'ram', category: 'Animals' },
    { char: '🐑', keywords: 'ewe', category: 'Animals' },
    { char: '🐐', keywords: 'goat', category: 'Animals' },
    { char: '🦌', keywords: 'deer', category: 'Animals' },
    { char: '🐕', keywords: 'dog', category: 'Animals' },
    { char: '🐩', keywords: 'poodle', category: 'Animals' },
    { char: '🦮', keywords: 'guide dog', category: 'Animals' },
    { char: '🐕‍🦺', keywords: 'service dog', category: 'Animals' },
    { char: '🐈', keywords: 'cat', category: 'Animals' },
    { char: '🐈‍⬛', keywords: 'black cat', category: 'Animals' },
    { char: '🐓', keywords: 'rooster', category: 'Animals' },
    { char: '🦃', keywords: 'turkey', category: 'Animals' },
    { char: '🦚', keywords: 'peacock', category: 'Animals' },
    { char: '🦜', keywords: 'parrot', category: 'Animals' },
    { char: '🦢', keywords: 'swan', category: 'Animals' },
    { char: '🦩', keywords: 'flamingo', category: 'Animals' },
    { char: '🕊️', keywords: 'dove', category: 'Animals' },
    { char: '🦝', keywords: 'raccoon', category: 'Animals' },
    { char: '🦨', keywords: 'skunk', category: 'Animals' },
    { char: '🦡', keywords: 'badger', category: 'Animals' },
    { char: '🦦', keywords: 'otter', category: 'Animals' },
    { char: '🦥', keywords: 'sloth', category: 'Animals' },
    { char: '🐁', keywords: 'mouse', category: 'Animals' },
    { char: '🐀', keywords: 'rat', category: 'Animals' },
    { char: '🐿️', keywords: 'chipmunk', category: 'Animals' },
    { char: '🦔', keywords: 'hedgehog', category: 'Animals' },
    { char: '🐾', keywords: 'paw prints', category: 'Animals' },
    { char: '🐉', keywords: 'dragon', category: 'Animals' },
    { char: '🐲', keywords: 'dragon face', category: 'Animals' },
    { char: '🌤️', keywords: 'partly sunny, sun, cloud, weather', category: 'Weather' },
    { char: '⛅', keywords: 'sun, cloud, weather', category: 'Weather' },
    { char: '🌥️', keywords: 'mostly cloudy, sun, cloud, weather', category: 'Weather' },
    { char: '☁️', keywords: 'cloud, cloudy, weather', category: 'Weather' },
    { char: '🌦️', keywords: 'sun, rain, weather', category: 'Weather' },
    { char: '🌧️', keywords: 'rain, rainy, weather', category: 'Weather' },
    { char: '⛈️', keywords: 'storm, thunder, rain, weather', category: 'Weather' },
    { char: '🌩️', keywords: 'lightning, storm, weather', category: 'Weather' },
    { char: '🌨️', keywords: 'snow, snowy, weather', category: 'Weather' },
    { char: '❄️', keywords: 'snowflake, winter, cold, weather', category: 'Weather' },
    { char: '🌬️', keywords: 'wind, windy, weather', category: 'Weather' },
    { char: '💨', keywords: 'dash, fast, wind', category: 'Weather' },
    { char: '🌪️', keywords: 'tornado, weather', category: 'Weather' },
    { char: '🌫️', keywords: 'fog, foggy, weather', category: 'Weather' },
    { char: '🌈', keywords: 'rainbow, weather, happy', category: 'Weather' },
    { char: '☔', keywords: 'umbrella, rain, weather', category: 'Weather' },
    { char: '⚡', keywords: 'voltage, lightning, energy', category: 'Weather' },
    { char: '☄️', keywords: 'comet, space', category: 'Weather' },
    { char: '🌙', keywords: 'moon, night, crescent', category: 'Weather' },
    { char: '🌕', keywords: 'full moon, night', category: 'Weather' },
    { char: '🌑', keywords: 'new moon', category: 'Weather' },
    { char: '🌒', keywords: 'waxing crescent moon', category: 'Weather' },
    { char: '🌓', keywords: 'first quarter moon', category: 'Weather' },
    { char: '🌔', keywords: 'waxing gibbous moon', category: 'Weather' },
    { char: '🌖', keywords: 'waning gibbous moon', category: 'Weather' },
    { char: '🌗', keywords: 'last quarter moon', category: 'Weather' },
    { char: '🌘', keywords: 'waning crescent moon', category: 'Weather' },
    { char: '🌚', keywords: 'new moon face', category: 'Weather' },
    { char: '🌛', keywords: 'first quarter moon face', category: 'Weather' },
    { char: '🌜', keywords: 'last quarter moon face', category: 'Weather' },
    { char: '🌝', keywords: 'full moon face', category: 'Weather' },
    { char: '🌞', keywords: 'sun with face', category: 'Weather' },
    { char: '🛍️', keywords: 'shopping, bags, mall, buy', category: 'Shopping' },
    { char: '🛒', keywords: 'cart, shopping, grocery', category: 'Shopping' },
    { char: '💰', keywords: 'money, cash, wealth', category: 'Shopping' },
    { char: '💳', keywords: 'credit card, payment', category: 'Shopping' },
    { char: '💵', keywords: 'dollar, money', category: 'Shopping' },
    { char: '🏷️', keywords: 'tag, price, sale', category: 'Shopping' },
    { char: '👗', keywords: 'dress, fashion, clothes', category: 'Shopping' },
    { char: '👕', keywords: 'shirt, t-shirt, clothes', category: 'Shopping' },
    { char: '👖', keywords: 'jeans, pants, clothes', category: 'Shopping' },
    { char: '👠', keywords: 'heels, shoes, fashion', category: 'Shopping' },
    { char: '👟', keywords: 'sneakers, shoes, sports', category: 'Shopping' },
    { char: '👞', keywords: 'shoe, fashion', category: 'Shopping' },
    { char: '👢', keywords: 'boot, fashion', category: 'Shopping' },
    { char: '👒', keywords: 'hat, fashion', category: 'Shopping' },
    { char: '🧢', keywords: 'cap, hat, fashion', category: 'Shopping' },
    { char: '👜', keywords: 'handbag, fashion', category: 'Shopping' },
    { char: '🕶️', keywords: 'sunglasses, cool', category: 'Shopping' },
    { char: '💎', keywords: 'gem, diamond, jewelry', category: 'Shopping' },
    { char: '💄', keywords: 'lipstick, makeup, beauty', category: 'Shopping' },
    { char: '🎪', keywords: 'circus, fun', category: 'Hobbies' },
    { char: '🎠', keywords: 'carousel, fun', category: 'Hobbies' },
    { char: '🎮', keywords: 'gaming, play, controller', category: 'Hobbies' },
    { char: '🎲', keywords: 'dice, game, board game', category: 'Hobbies' },
    { char: '🧩', keywords: 'puzzle, game', category: 'Hobbies' },
    { char: '♟️', keywords: 'chess, game', category: 'Hobbies' },
    { char: '🃏', keywords: 'cards, game', category: 'Hobbies' },
    { char: '🪵', keywords: 'wood, fire', category: 'Hobbies' },
    { char: '🔨', keywords: 'hammer, diy, fix', category: 'Hobbies' },
    { char: '🪚', keywords: 'saw, diy, wood', category: 'Hobbies' },
    { char: '🔧', keywords: 'wrench, diy, fix', category: 'Hobbies' },
    { char: '🪛', keywords: 'screwdriver, diy', category: 'Hobbies' },
    { char: '🪀', keywords: 'yo-yo', category: 'Hobbies' },
    { char: '🪁', keywords: 'kite', category: 'Hobbies' },
    { char: '🎱', keywords: 'pool 8 ball', category: 'Hobbies' },
    { char: '🔮', keywords: 'crystal ball', category: 'Hobbies' },
    { char: '🧿', keywords: 'nazar amulet', category: 'Hobbies' },
    { char: '🕹️', keywords: 'joystick', category: 'Hobbies' },
    { char: '🎰', keywords: 'slot machine', category: 'Hobbies' },
    { char: '🧸', keywords: 'teddy bear', category: 'Hobbies' },
    { char: '🪅', keywords: 'piñata', category: 'Hobbies' },
    { char: '🪩', keywords: 'mirror ball', category: 'Hobbies' },
    { char: '🀄', keywords: 'mahjong red dragon', category: 'Hobbies' },
    { char: '🎴', keywords: 'flower playing cards', category: 'Hobbies' },
    { char: '👨‍👩‍👧‍👦', keywords: 'family, parents, kids', category: 'Family' },
    { char: '👩‍❤️‍👨', keywords: 'couple, love', category: 'Family' },
    { char: '👫', keywords: 'couple, friends', category: 'Family' },
    { char: '👯', keywords: 'friends, party, dancers', category: 'Family' },
    { char: '🫂', keywords: 'hug, support', category: 'Family' },
    { char: '🤝', keywords: 'handshake, deal, meet', category: 'Family' },
    { char: '👋', keywords: 'wave, hello', category: 'Family' },
    { char: '👵', keywords: 'grandma, elderly', category: 'Family' },
    { char: '👴', keywords: 'grandpa, elderly', category: 'Family' },
    { char: '🧑‍💻', keywords: 'developer, tech, work', category: 'Family' },
    { char: '🧑‍🍳', keywords: 'cook, chef, kitchen', category: 'Family' },
    { char: '🧑‍🏫', keywords: 'teacher, school', category: 'Family' },
    { char: '🧑‍🎨', keywords: 'artist, painting', category: 'Family' },
    { char: '🧑‍🔬', keywords: 'scientist, lab', category: 'Family' },
    { char: '🧑‍🚀', keywords: 'astronaut, space', category: 'Family' },
    { char: '🦸', keywords: 'superhero, hero', category: 'Family' },
    { char: '🥷', keywords: 'ninja, stealth', category: 'Family' },
    { char: '📱', keywords: 'phone, mobile, tech', category: 'Tech' },
    { char: '📷', keywords: 'camera, photo, memory, photography', category: 'Tech' },
    { char: '🎥', keywords: 'movie, film, cinema', category: 'Tech' },
    { char: '📺', keywords: 'tv, show, watch', category: 'Tech' },
    { char: '🎵', keywords: 'music, song, concert, melody', category: 'Tech' },
    { char: '🎸', keywords: 'guitar, music, instrument', category: 'Tech' },
    { char: '🎹', keywords: 'piano, music', category: 'Tech' },
    { char: '🎷', keywords: 'sax, music', category: 'Tech' },
    { char: '🎺', keywords: 'trumpet, music', category: 'Tech' },
    { char: '🎻', keywords: 'violin, music', category: 'Tech' },
    { char: '🎧', keywords: 'headphones, music', category: 'Tech' },
    { char: '📻', keywords: 'radio, music', category: 'Tech' },
    { char: '📽️', keywords: 'projector, movie', category: 'Tech' },
    { char: '🖱️', keywords: 'mouse, tech', category: 'Tech' },
    { char: '⌨️', keywords: 'keyboard, tech', category: 'Tech' },
    { char: '🔋', keywords: 'battery, tech', category: 'Tech' },
    { char: '🎨', keywords: 'palette, art, painting', category: 'Art' },
    { char: '🎭', keywords: 'drama, theater, arts', category: 'Art' },
    { char: '🧵', keywords: 'thread, sewing, hobby', category: 'Art' },
    { char: '🧶', keywords: 'yarn, knitting, hobby', category: 'Art' },
    { char: '🖼️', keywords: 'framed picture', category: 'Art' },
    { char: '🪡', keywords: 'sewing needle', category: 'Art' },
    { char: '🪢', keywords: 'knot', category: 'Art' },
    { char: '❤️', keywords: 'heart, love, like', category: 'Symbols' },
    { char: '✨', keywords: 'sparkles, magic, new', category: 'Symbols' },
    { char: '💡', keywords: 'idea, light, thinking', category: 'Symbols' },
    { char: '🔔', keywords: 'reminder, notification', category: 'Symbols' },
    { char: '🔒', keywords: 'private, lock, secure', category: 'Symbols' },
    { char: '📍', keywords: 'location, place', category: 'Symbols' },
    { char: '📌', keywords: 'pin, mark', category: 'Symbols' },
    { char: '🔍', keywords: 'search, find', category: 'Symbols' },
    { char: '⚙️', keywords: 'gear, settings', category: 'Symbols' },
    { char: '🛠️', keywords: 'tools, fix', category: 'Symbols' },
    { char: '🧱', keywords: 'brick, build', category: 'Symbols' },
    { char: '🧡', keywords: 'orange heart', category: 'Symbols' },
    { char: '💛', keywords: 'yellow heart', category: 'Symbols' },
    { char: '💚', keywords: 'green heart', category: 'Symbols' },
    { char: '💙', keywords: 'blue heart', category: 'Symbols' },
    { char: '💜', keywords: 'purple heart', category: 'Symbols' },
    { char: '🖤', keywords: 'black heart', category: 'Symbols' },
    { char: '🤍', keywords: 'white heart', category: 'Symbols' },
    { char: '🤎', keywords: 'brown heart', category: 'Symbols' },
    { char: '💔', keywords: 'broken heart', category: 'Symbols' },
    { char: '❣️', keywords: 'heart exclamation', category: 'Symbols' },
    { char: '💕', keywords: 'two hearts', category: 'Symbols' },
    { char: '💞', keywords: 'revolving hearts', category: 'Symbols' },
    { char: '💓', keywords: 'beating heart', category: 'Symbols' },
    { char: '💗', keywords: 'growing heart', category: 'Symbols' },
    { char: '💖', keywords: 'sparkling heart', category: 'Symbols' },
    { char: '💘', keywords: 'cupid, love', category: 'Symbols' },
    { char: '💝', keywords: 'heart with ribbon', category: 'Symbols' },
    { char: '💟', keywords: 'heart decoration', category: 'Symbols' },
    { char: '☮️', keywords: 'peace', category: 'Symbols' },
    { char: '✝️', keywords: 'cross, religion', category: 'Symbols' },
    { char: '☪️', keywords: 'star and crescent, religion', category: 'Symbols' },
    { char: '🕉️', keywords: 'om, religion', category: 'Symbols' },
    { char: '☸️', keywords: 'wheel of dharma, religion', category: 'Symbols' },
    { char: '✡️', keywords: 'star of david, religion', category: 'Symbols' },
    { char: '🔯', keywords: 'six pointed star', category: 'Symbols' },
    { char: '🕎', keywords: 'menorah, religion', category: 'Symbols' },
    { char: '☯️', keywords: 'yin yang, balance', category: 'Symbols' },
    { char: '☦️', keywords: 'orthodox cross, religion', category: 'Symbols' },
    { char: '🛐', keywords: 'place of worship', category: 'Symbols' },
    { char: '⛎', keywords: 'ophiuchus, zodiac', category: 'Symbols' },
    { char: '♈', keywords: 'aries, zodiac', category: 'Symbols' },
    { char: '♉', keywords: 'taurus, zodiac', category: 'Symbols' },
    { char: '♊', keywords: 'gemini, zodiac', category: 'Symbols' },
    { char: '♋', keywords: 'cancer, zodiac', category: 'Symbols' },
    { char: '♌', keywords: 'leo, zodiac', category: 'Symbols' },
    { char: '♍', keywords: 'virgo, zodiac', category: 'Symbols' },
    { char: '♎', keywords: 'libra, zodiac', category: 'Symbols' },
    { char: '♏', keywords: 'scorpio, zodiac', category: 'Symbols' },
    { char: '♐', keywords: 'sagittarius, zodiac', category: 'Symbols' },
    { char: '♑', keywords: 'capricorn, zodiac', category: 'Symbols' },
    { char: '♒', keywords: 'aquarius, zodiac', category: 'Symbols' },
    { char: '♓', keywords: 'pisces, zodiac', category: 'Symbols' },
    { char: '🆔', keywords: 'id', category: 'Symbols' },
    { char: '⚛️', keywords: 'atom, science', category: 'Symbols' },
    { char: '⚕️', keywords: 'medical', category: 'Symbols' },
    { char: '⚠️', keywords: 'warning, caution', category: 'Symbols' },
    { char: '🚸', keywords: 'children crossing, school', category: 'Symbols' },
    { char: '⛔', keywords: 'no entry', category: 'Symbols' },
    { char: '🚫', keywords: 'prohibited', category: 'Symbols' },
    { char: '🆘', keywords: 'sos, help', category: 'Symbols' },
    { char: '♨️', keywords: 'hot springs', category: 'Symbols' },
    { char: '🛑', keywords: 'stop', category: 'Symbols' },
    { char: '❌', keywords: 'cross, mark', category: 'Symbols' },
    { char: '✅', keywords: 'check, mark', category: 'Symbols' },
    { char: '❓', keywords: 'question, mark', category: 'Symbols' },
    { char: '❗', keywords: 'exclamation, mark', category: 'Symbols' },
    { char: '🚩', keywords: 'triangular flag', category: 'Symbols' },
    { char: '🎌', keywords: 'crossed flags', category: 'Symbols' },
    { char: '🏴', keywords: 'black flag', category: 'Symbols' },
    { char: '🏳️', keywords: 'white flag', category: 'Symbols' },
    { char: '🏳️‍🌈', keywords: 'pride, rainbow flag', category: 'Symbols' },
    { char: '🏳️‍⚧️', keywords: 'transgender flag', category: 'Symbols' },
    { char: '😀', keywords: 'happy, smile, face', category: 'Faces' },
    { char: '😂', keywords: 'laugh, lol, face', category: 'Faces' },
    { char: '😊', keywords: 'smile, happy, face', category: 'Faces' },
    { char: '😍', keywords: 'love, heart, face', category: 'Faces' },
    { char: '🥰', keywords: 'love, hearts, face', category: 'Faces' },
    { char: '😎', keywords: 'cool, glasses, face', category: 'Faces' },
    { char: '🤔', keywords: 'think, face', category: 'Faces' },
    { char: '😴', keywords: 'sleep, tired, face', category: 'Faces' },
    { char: '🤩', keywords: 'star, eyes, face', category: 'Faces' },
    { char: '🥺', keywords: 'please, face', category: 'Faces' },
    { char: '😇', keywords: 'angel, face', category: 'Faces' },
    { char: '🤯', keywords: 'mind blown, wow, face', category: 'Faces' },
    { char: '🤫', keywords: 'quiet, shh, face', category: 'Faces' },
    { char: '🫠', keywords: 'melt, face', category: 'Faces' },
    { char: '👍', keywords: 'good, like, yes', category: 'Faces' },
    { char: '🙌', keywords: 'celebrate, hands', category: 'Faces' },
    { char: '👏', keywords: 'clap, hands', category: 'Faces' },
    { char: '🙏', keywords: 'please, thanks, pray', category: 'Faces' },
    { char: '💪', keywords: 'strong, fitness, gym', category: 'Faces' },
    { char: '🤳', keywords: 'selfie, phone', category: 'Faces' },
    { char: '🫢', keywords: 'face with open eyes and hand over mouth', category: 'Faces' },
    { char: '🫣', keywords: 'face with peeking eye', category: 'Faces' },
    { char: '🫡', keywords: 'saluting face', category: 'Faces' },
    { char: '🫥', keywords: 'dotted line face', category: 'Faces' },
    { char: '🫤', keywords: 'face with diagonal mouth', category: 'Faces' },
    { char: '🥹', keywords: 'face holding back tears', category: 'Faces' },
    { char: '🤡', keywords: 'clown face', category: 'Faces' },
    { char: '👻', keywords: 'ghost', category: 'Faces' },
    { char: '👽', keywords: 'alien', category: 'Faces' },
    { char: '👾', keywords: 'alien monster, game', category: 'Faces' },
    { char: '🤖', keywords: 'robot', category: 'Faces' },
    { char: '🎃', keywords: 'jack-o-lantern, halloween', category: 'Faces' },
    { char: '😺', keywords: 'grinning cat', category: 'Faces' },
    { char: '😸', keywords: 'grinning cat with smiling eyes', category: 'Faces' },
    { char: '😹', keywords: 'cat with tears of joy', category: 'Faces' },
    { char: '😻', keywords: 'smiling cat with heart-eyes', category: 'Faces' },
    { char: '😼', keywords: 'cat with wry smile', category: 'Faces' },
    { char: '😽', keywords: 'kissing cat', category: 'Faces' },
    { char: '🙀', keywords: 'weary cat', category: 'Faces' },
    { char: '😿', keywords: 'crying cat', category: 'Faces' },
    { char: '😾', keywords: 'pouting cat', category: 'Faces' }
];

let currentView = 'timeline'; 
let events = [];
let categories = [];
let selectedCategoryId = 'all';
let selectedIcon = '🎉';
let editingEventId = null;
let contextEventId = null;

let pickerContext = 'modal'; // 'modal', 'context', or 'category'

// Auth Logic
async function checkUser() {
    if (!supabaseClient) {
        showAuth();
        return;
    }
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (user && !error) {
            showApp();
        } else {
            showAuth();
        }
    } catch (e) {
        console.error("Auth check failed:", e);
        showAuth();
    }
}

function setupAuthListener() {
    if (!supabaseClient) return;
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            if (session) showApp();
        }
        if (event === 'SIGNED_OUT') {
            showAuth();
        }
    });
}

function showApp() {
    authScreen.classList.add('hidden');
    appContent.classList.remove('hidden');
    init();
}

function showAuth() {
    authScreen.classList.remove('hidden');
    appContent.classList.add('hidden');
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.classList.add('hidden');
    const email = authEmail.value;
    const password = authPassword.value;

    if (!supabaseClient) {
        authError.innerText = "Supabase not connected. Check console for errors.";
        authError.classList.remove('hidden');
        return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        authError.innerText = error.message;
        authError.classList.remove('hidden');
    } else {
        showApp();
    }
});

logoutBtn.addEventListener('click', async () => {
    if (supabaseClient) await supabaseClient.auth.signOut();
    showAuth();
});

// Persistence Helper
function saveData() {
    if (!supabaseClient) {
        localStorage.setItem('countdown_events', JSON.stringify(events));
        localStorage.setItem('countdown_categories', JSON.stringify(categories));
    }
}

function loadFallbackData() {
    const savedEvents = localStorage.getItem('countdown_events');
    const savedCats = localStorage.getItem('countdown_categories');
    
    if (savedEvents) {
        events = JSON.parse(savedEvents);
    } else {
        events = [
            { title: 'Trip', date: '2026-08-23', color: 'bg-green-500', icon: '✈️', category_id: null, starred: true },
            { title: 'Mom\'s Birthday', date: '2026-04-17', color: 'bg-pink-500', icon: '🎂', category_id: 1, starred: false },
            { title: 'Exam 1', date: '2026-02-23', color: 'bg-blue-500', icon: '✏️', category_id: null, starred: true }
        ];
    }

    if (savedCats) {
        categories = JSON.parse(savedCats);
    } else {
        categories = [
            { id: 1, name: 'Birthday', emoji: '🎂', color_default: 'bg-pink-500' }
        ];
    }
}

// Emoji Picker Logic
function initEmojiPicker() {
    renderEmojis(COMMON_EMOJIS);

    selectedIconDisplay.addEventListener('click', (e) => {
        e.stopPropagation();
        pickerContext = 'modal';
        const rect = selectedIconDisplay.getBoundingClientRect();
        positionEmojiPicker(rect.right - 256, rect.top - 200);
        
        emojiPicker.classList.toggle('hidden');
        if (!emojiPicker.classList.contains('hidden')) {
            emojiSearch.focus();
        }
    });

    menuUpdateIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        pickerContext = 'context';
        const rect = menuUpdateIcon.getBoundingClientRect();
        positionEmojiPicker(rect.left - 260, rect.top);
        
        emojiPicker.classList.toggle('hidden');
        if (!emojiPicker.classList.contains('hidden')) {
            emojiSearch.focus();
        }
    });

    newCategoryEmojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pickerContext = 'category';
        const rect = newCategoryEmojiBtn.getBoundingClientRect();
        positionEmojiPicker(rect.left, rect.top - 250);
        
        emojiPicker.classList.toggle('hidden');
        if (!emojiPicker.classList.contains('hidden')) {
            emojiSearch.focus();
        }
    });

    emojiSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            renderEmojis(COMMON_EMOJIS);
            return;
        }
        
        const filtered = COMMON_EMOJIS.filter(emoji => 
            emoji.char.includes(query) || emoji.keywords.includes(query) || emoji.category.toLowerCase().includes(query)
        );
        renderEmojis(filtered);
    });

    document.addEventListener('mousedown', (e) => {
        if (emojiPicker.classList.contains('hidden')) return;
        
        if (!emojiPicker.contains(e.target) && 
            !selectedIconDisplay.contains(e.target) && 
            !menuUpdateIcon.contains(e.target) &&
            !newCategoryEmojiBtn.contains(e.target)) {
            emojiPicker.classList.add('hidden');
        }
    });
}

function positionEmojiPicker(x, y) {
    const maxX = window.innerWidth - 270;
    const maxY = window.innerHeight - 250;
    emojiPicker.style.left = `${Math.max(10, Math.min(x, maxX))}px`;
    emojiPicker.style.top = `${Math.max(10, Math.min(y, maxY))}px`;
}

function renderEmojis(emojiArray) {
    const isSearch = emojiSearch.value.length > 0;
    
    if (isSearch) {
        emojiList.className = "grid grid-cols-6 gap-1 p-2 max-h-48 overflow-y-auto custom-scrollbar";
        emojiList.innerHTML = emojiArray.map(emoji => `
            <button class="emoji-item w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl transition-colors" data-emoji="${emoji.char}">
                ${emoji.char}
            </button>
        `).join('');
    } else {
        const groups = {};
        emojiArray.forEach(emoji => {
            if (!groups[emoji.category]) groups[emoji.category] = [];
            groups[emoji.category].push(emoji);
        });

        emojiList.className = "flex flex-col p-2 max-h-48 overflow-y-auto custom-scrollbar";
        let html = '';
        
        for (const category in groups) {
            html += `
                <div class="mb-3">
                    <h3 class="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5 px-1">${category}</h3>
                    <div class="grid grid-cols-6 gap-1">
                        ${groups[category].map(emoji => `
                            <button class="emoji-item w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl transition-colors" data-emoji="${emoji.char}">
                                ${emoji.char}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        emojiList.innerHTML = html;
    }

    document.querySelectorAll('.emoji-item').forEach(item => {
        item.addEventListener('click', async () => {
            const emoji = item.dataset.emoji;
            if (pickerContext === 'modal') {
                updateSelectedIcon(emoji);
            } else if (pickerContext === 'context' && contextEventId) {
                await updateEventIconDirectly(contextEventId, emoji);
                closeContextMenu();
            } else if (pickerContext === 'category') {
                newCategoryEmojiBtn.innerText = emoji;
            }
            emojiPicker.classList.add('hidden');
        });
    });
}

async function updateEventIconDirectly(eventId, emoji) {
    const index = events.findIndex(e => (e.id || e.tempId) == eventId);
    if (index !== -1) {
        events[index].icon = emoji;
        
        if (supabaseClient && events[index].id) {
            await supabaseClient.from('countdown_events').update({ icon: emoji }).eq('id', events[index].id);
        }
        saveData();
        renderEvents(events);
    }
}

function updateSelectedIcon(emoji) {
    selectedIcon = emoji;
    currentEmojiDisplay.innerText = emoji;
}

initEmojiPicker();

// Set current date in header
if (currentDateEl) {
    const now = new Date();
    currentDateEl.innerText = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
}

// Modal Logic
function openModal(eventData = null) {
    editingEventId = eventData ? (eventData.id || eventData.tempId) : null;
    modalOverlay.classList.remove('hidden');
    void newEventModal.offsetWidth;
    newEventModal.classList.remove('scale-95', 'opacity-0');
    
    const modalTitle = newEventModal.querySelector('h2');
    if (modalTitle) modalTitle.innerText = editingEventId ? 'Edit Event' : 'New Event';

    renderModalCategoryTabs();

    if (eventData) {
        eventTitleInput.value = eventData.title || '';
        eventNotesInput.value = eventData.notes || '';
        eventDateInput.value = eventData.date || '';
        const catId = eventData.category_id || 'none';
        
        document.querySelectorAll('.modal-category-tab').forEach(tab => {
            tab.classList.remove('bg-blue-600');
            if (tab.dataset.categoryId == catId) tab.classList.add('bg-blue-600');
        });

        updateSelectedIcon(eventData.icon || '🎉');
        
        if (eventTagsInput) eventTagsInput.value = eventData.tags || '';
        if (eventStarredInput) eventStarredInput.checked = !!eventData.starred;
        if (eventUrlInput) eventUrlInput.value = eventData.url || '';
        if (eventMultiDayInput) eventMultiDayInput.checked = !!eventData.multi_day;

    } else {
        eventTitleInput.value = '';
        eventNotesInput.value = '';
        const today = new Date().toISOString().split('T')[0];
        eventDateInput.value = today;
        
        const defaultCatId = categories.length > 0 ? categories[0].id : 'none';
        document.querySelectorAll('.modal-category-tab').forEach(tab => {
            tab.classList.remove('bg-blue-600');
            if (tab.dataset.categoryId == defaultCatId) tab.classList.add('bg-blue-600');
        });

        updateSelectedIcon('🎉');
        
        if (eventTagsInput) eventTagsInput.value = '';
        if (eventStarredInput) eventStarredInput.checked = false;
        if (eventUrlInput) eventUrlInput.value = '';
        if (eventMultiDayInput) eventMultiDayInput.checked = false;
    }
}

function closeModal() {
    newEventModal.classList.add('scale-95', 'opacity-0');
    moreInfoModal.classList.add('scale-95', 'opacity-0');
    quickNotesModal.classList.add('scale-95', 'opacity-0');
    manageCategoriesModal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modalOverlay.classList.add('hidden');
        moreInfoModal.classList.add('hidden');
        quickNotesModal.classList.add('hidden');
        manageCategoriesModal.classList.add('hidden');
        newEventModal.classList.remove('hidden');
    }, 200);
}

addEventBtn.addEventListener('click', () => openModal());
cancelEventBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// Context Menu Logic
window.handleEventClick = function(eventId) {
    const e = window.event;
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    const x = e?.clientX || 0;
    const y = e?.clientY || 0;
    openContextMenu(x, y, eventId);
};

function openContextMenu(x, y, eventId) {
    contextEventId = eventId;
    const event = events.find(e => (e.id || e.tempId) == eventId);
    if (!event) return;

    starLabel.innerText = event.starred ? 'Unstar' : 'Star';

    contextMenu.style.left = `${Math.min(x, window.innerWidth - 240)}px`;
    contextMenu.style.top = `${Math.min(y, window.innerHeight - 400)}px`;
    contextMenu.classList.remove('hidden');
    void contextMenu.offsetWidth;
    contextMenu.classList.remove('opacity-0');
}

function closeContextMenu() {
    contextMenu.classList.add('opacity-0');
    emojiPicker.classList.add('hidden');
    setTimeout(() => {
        contextMenu.classList.add('hidden');
    }, 200);
}

window.addEventListener('mousedown', (e) => {
    if (contextMenu.classList.contains('hidden') || contextMenu.classList.contains('opacity-0')) return;
    if (!contextMenu.contains(e.target) && !emojiPicker.contains(e.target)) {
        closeContextMenu();
    }
});

menuEdit.addEventListener('click', () => {
    const event = events.find(e => (e.id || e.tempId) == contextEventId);
    if (event) openModal(event);
    closeContextMenu();
});

menuDelete.addEventListener('click', async () => {
    if (!contextEventId) return;
    
    if (confirm('Are you sure you want to delete this event?')) {
        const index = events.findIndex(e => (e.id || e.tempId) == contextEventId);
        if (index !== -1) {
            const eventToDelete = events[index];
            events.splice(index, 1);
            
            if (supabaseClient && eventToDelete.id) {
                await supabaseClient.from('countdown_events').delete().eq('id', eventToDelete.id);
            }
            saveData();
            renderEvents(events);
        }
    }
    closeContextMenu();
});

async function duplicateEvent(eventId) {
    const event = events.find(e => (e.id || e.tempId) == eventId);
    if (!event) return;

    const duplicateData = { 
        title: `${event.title} (Copy)`,
        date: event.date,
        icon: event.icon,
        category_id: event.category_id,
        notes: event.notes,
        tags: event.tags,
        starred: event.starred,
        url: event.url,
        multi_day: event.multi_day,
        color: event.color || 'bg-blue-500'
    };

    if (supabaseClient) {
        const { data, error } = await supabaseClient
            .from('countdown_events')
            .insert([duplicateData])
            .select();
        
        if (!error && data && data.length > 0) {
            events.push(data[0]);
        } else {
            console.error('Error duplicating in Supabase:', error);
            const localDuplicate = { ...duplicateData, tempId: Math.random().toString(36).substr(2, 9) };
            events.push(localDuplicate);
        }
    } else {
        const localDuplicate = { ...duplicateData, tempId: Math.random().toString(36).substr(2, 9) };
        events.push(localDuplicate);
    }
    saveData();
    renderEvents(events);
}

menuDuplicate.addEventListener('click', async () => {
    await duplicateEvent(contextEventId);
    closeContextMenu();
});

menuNotes.addEventListener('click', () => {
    const event = events.find(e => (e.id || e.tempId) == contextEventId);
    if (event) {
        newEventModal.classList.add('hidden');
        moreInfoModal.classList.add('hidden');
        manageCategoriesModal.classList.add('hidden');
        modalOverlay.classList.remove('hidden');

        quickNotesInput.value = event.notes || '';
        quickNotesModal.classList.remove('hidden');
        void quickNotesModal.offsetWidth;
        quickNotesModal.classList.remove('scale-95', 'opacity-0');
        setTimeout(() => quickNotesInput.focus(), 100);
    }
    closeContextMenu();
});

saveQuickNotesBtn.addEventListener('click', async () => {
    const index = events.findIndex(e => (e.id || e.tempId) == contextEventId);
    if (index !== -1) {
        const newNotes = quickNotesInput.value.trim();
        events[index].notes = newNotes;
        
        if (supabaseClient && events[index].id) {
            await supabaseClient.from('countdown_events').update({ notes: newNotes }).eq('id', events[index].id);
        }
        saveData();
        renderEvents(events);
    }
    closeModal();
});

cancelQuickNotesBtn.addEventListener('click', closeModal);

menuStar.addEventListener('click', async () => {
    const index = events.findIndex(e => (e.id || e.tempId) == contextEventId);
    if (index !== -1) {
        events[index].starred = !events[index].starred;
        
        if (supabaseClient && events[index].id) {
            await supabaseClient.from('countdown_events').update({ starred: events[index].starred }).eq('id', events[index].id);
        }
        saveData();
        renderEvents(events);
    }
    closeContextMenu();
});

addMoreInfoBtn.addEventListener('click', () => {
    newEventModal.classList.add('hidden');
    moreInfoModal.classList.remove('hidden');
    void moreInfoModal.offsetWidth;
    moreInfoModal.classList.remove('scale-95', 'opacity-0');
});

closeMoreInfoBtn.addEventListener('click', () => {
    moreInfoModal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        moreInfoModal.classList.add('hidden');
        newEventModal.classList.remove('hidden');
        void newEventModal.offsetWidth;
        newEventModal.classList.remove('scale-95', 'opacity-0');
    }, 200);
});

// Category Management Logic
manageCategoriesBtn.addEventListener('click', () => {
    manageCategoriesModal.classList.remove('hidden');
    void manageCategoriesModal.offsetWidth;
    manageCategoriesModal.classList.remove('scale-95', 'opacity-0');
    renderCategoriesList();
});

closeManageCategoriesBtn.addEventListener('click', () => {
    manageCategoriesModal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        manageCategoriesModal.classList.add('hidden');
    }, 200);
});

saveNewCategoryBtn.addEventListener('click', async () => {
    const name = newCategoryNameInput.value.trim();
    const emoji = newCategoryEmojiBtn.innerText;
    
    if (!name) return;

    const newCat = { name, emoji, color_default: 'bg-blue-500' };
    
    if (supabaseClient) {
        const { data, error } = await supabaseClient.from('categories').insert([newCat]).select();
        if (!error && data) {
            categories.push(data[0]);
        }
    } else {
        newCat.id = Date.now();
        categories.push(newCat);
    }

    newCategoryNameInput.value = '';
    newCategoryEmojiBtn.innerText = '📁';
    saveData();
    renderCategoriesList();
    renderCategoryFilterBar();
});

function renderCategoriesList() {
    categoriesListEl.innerHTML = categories.map(cat => `
        <div class="flex items-center justify-between bg-[#2c2c2e] p-3 rounded-xl">
            <div class="flex items-center gap-3">
                <span class="text-xl">${cat.emoji}</span>
                <span class="font-medium">${cat.name}</span>
            </div>
            <button onclick="deleteCategory(${cat.id})" class="text-red-500 text-sm font-bold">Delete</button>
        </div>
    `).join('');
}

window.deleteCategory = async (id) => {
    if (!confirm('Delete this category? Events in this category will become uncategorized.')) return;
    
    const index = categories.findIndex(c => c.id == id);
    if (index !== -1) {
        categories.splice(index, 1);
        if (supabaseClient) {
            await supabaseClient.from('categories').delete().eq('id', id);
        }
        
        events.forEach(e => {
            if (e.category_id == id) e.category_id = null;
        });
        
        saveData();
        renderCategoriesList();
        renderCategoryFilterBar();
        renderEvents(events);
    }
};

function renderCategoryFilterBar() {
    const smartFilters = [
        { id: 'upcoming', name: 'Upcoming', emoji: '📅' },
        { id: 'starred', name: 'Starred', emoji: '⭐' },
        { id: 'all', name: 'All', emoji: '🌐' }
    ];

    let html = smartFilters.map(f => `
        <button class="filter-tab px-4 py-1.5 rounded-full text-sm font-semibold ${selectedCategoryId === f.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'} whitespace-nowrap" data-category-id="${f.id}">
            ${f.emoji} ${f.name}
        </button>
    `).join('');

    html += categories.map(cat => `
        <button class="filter-tab px-4 py-1.5 rounded-full text-sm font-semibold ${selectedCategoryId == cat.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'} whitespace-nowrap" data-category-id="${cat.id}">
            ${cat.emoji} ${cat.name}
        </button>
    `).join('');

    html += `
        <button id="manageCategoriesBtn" class="px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 whitespace-nowrap flex items-center gap-1">
            <span>+</span> Edit
        </button>
    `;

    categoryFilterBar.innerHTML = html;
    
    categoryFilterBar.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            selectedCategoryId = tab.dataset.categoryId;
            
            categoryFilterBar.querySelectorAll('.filter-tab').forEach(t => {
                t.classList.remove('bg-black', 'text-white');
                t.classList.add('bg-gray-100', 'text-gray-600');
            });
            tab.classList.add('bg-black', 'text-white');
            tab.classList.remove('bg-gray-100', 'text-gray-600');

            const smart = smartFilters.find(f => f.id === selectedCategoryId);
            const cat = categories.find(c => c.id == selectedCategoryId);
            viewTitle.innerText = smart ? smart.name : (cat ? cat.name : 'All');
            
            renderEvents(events);
        });
    });

    document.getElementById('manageCategoriesBtn').addEventListener('click', () => {
        manageCategoriesModal.classList.remove('hidden');
        void manageCategoriesModal.offsetWidth;
        manageCategoriesModal.classList.remove('scale-95', 'opacity-0');
        renderCategoriesList();
    });
}

function renderModalCategoryTabs() {
    let html = categories.map(cat => `
        <button class="modal-category-tab flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold whitespace-nowrap" data-category-id="${cat.id}">
            ${cat.name}
        </button>
    `).join('');
    
    html += `
        <button class="modal-category-tab flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold whitespace-nowrap" data-category-id="none">
            None
        </button>
    `;

    modalCategoryTabs.innerHTML = html;

    modalCategoryTabs.querySelectorAll('.modal-category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            modalCategoryTabs.querySelectorAll('.modal-category-tab').forEach(t => t.classList.remove('bg-blue-600'));
            tab.classList.add('bg-blue-600');
        });
    });
}

// Save Logic
saveEventBtn.addEventListener('click', async () => {
    const title = eventTitleInput.value.trim();
    const date = eventDateInput.value;
    
    if (!title || !date) {
        alert('Please enter a title and date');
        return;
    }

    const activeTab = modalCategoryTabs.querySelector('.modal-category-tab.bg-blue-600');
    const categoryId = activeTab ? (activeTab.dataset.categoryId === 'none' ? null : activeTab.dataset.categoryId) : null;

    const eventData = {
        title,
        date,
        icon: selectedIcon,
        category_id: categoryId,
        notes: eventNotesInput.value.trim(),
        tags: eventTagsInput ? eventTagsInput.value : '',
        starred: eventStarredInput ? eventStarredInput.checked : false,
        url: eventUrlInput ? eventUrlInput.value : '',
        multi_day: eventMultiDayInput ? eventMultiDayInput.checked : false,
        color: 'bg-blue-500'
    };

    if (editingEventId) {
        const index = events.findIndex(e => (e.id || e.tempId) == editingEventId);
        if (index !== -1) {
            events[index] = { ...events[index], ...eventData };
            
            if (supabaseClient && events[index].id) {
                await supabaseClient.from('countdown_events').update(eventData).eq('id', events[index].id);
            }
        }
    } else {
        const newEvent = { ...eventData, tempId: Math.random().toString(36).substr(2, 9) };
        
        if (supabaseClient) {
            const { data, error } = await supabaseClient.from('countdown_events').insert([eventData]).select();
            if (!error && data) {
                events.push(data[0]);
            } else {
                events.push(newEvent);
            }
        } else {
            events.push(newEvent);
        }
    }

    saveData();
    renderEvents(events);
    closeModal();
});

function calculateDays(eventDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(eventDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function renderEvents(eventsToRender) {
    let filtered = eventsToRender;
    if (selectedCategoryId === 'upcoming') {
        filtered = eventsToRender.filter(e => calculateDays(e.date) >= 0);
    } else if (selectedCategoryId === 'starred') {
        filtered = eventsToRender.filter(e => e.starred);
    } else if (selectedCategoryId !== 'all') {
        filtered = eventsToRender.filter(e => e.category_id == selectedCategoryId);
    }

    filtered.forEach(e => {
        if (!e.id && !e.tempId) e.tempId = Math.random().toString(36).substr(2, 9);
    });

    gridView.innerHTML = filtered.map(event => {
        const days = calculateDays(event.date);
        const eventId = event.id || event.tempId;
        const cat = categories.find(c => c.id == event.category_id);
        return `
            <div class="${event.color || 'bg-blue-500'} text-white p-6 rounded-3xl shadow-lg aspect-square flex flex-col justify-between cursor-pointer active:scale-95 transition-transform" 
                 onclick="handleEventClick('${eventId}')">
                <div class="flex justify-between items-start">
                    <div class="text-xl font-bold">${event.title}</div>
                    <div class="text-xl">${cat ? cat.emoji : ''}</div>
                </div>
                <div class="flex flex-col gap-1">
                    <div class="flex items-baseline gap-2">
                        <div class="text-3xl font-bold">${Math.abs(days)}</div>
                        ${event.notes ? `<div class="text-xs opacity-70 line-clamp-2 italic">${event.notes}</div>` : ''}
                    </div>
                    <div class="text-sm opacity-80 uppercase tracking-wider">${days === 0 ? 'Today' : (days > 0 ? 'Days Until' : 'Days Since')}</div>
                </div>
            </div>
        `;
    }).join('');

    const grouped = filtered.reduce((acc, event) => {
        const catId = event.category_id || 'none';
        if (!acc[catId]) acc[catId] = [];
        acc[catId].push(event);
        return acc;
    }, {});

    timelineView.innerHTML = Object.entries(grouped).map(([catId, catEvents]) => {
        const cat = categories.find(c => c.id == catId);
        const catName = cat ? cat.name : 'Uncategorized';
        
        return `
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-green-400 mb-6 px-4">${catName}</h2>
                <div class="relative px-4">
                    <div class="absolute left-[104px] top-0 bottom-0 border-l-2 border-dotted border-green-300"></div>
                    <div class="flex flex-col gap-10">
                        ${catEvents.map(event => {
                            const days = calculateDays(event.date);
                            const dateObj = new Date(event.date);
                            const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
                            const day = dateObj.toLocaleDateString('en-US', { day: 'numeric' });
                            const year = dateObj.getFullYear();
                            const eventId = event.id || event.tempId;
                            
                            return `
                                <div class="flex items-start gap-6 relative group cursor-pointer" onclick="handleEventClick('${eventId}')">
                                    <div class="w-16 text-right pt-1 flex-shrink-0">
                                        <div class="text-gray-400 font-bold text-xl leading-none mb-1">${month} ${day}</div>
                                        <div class="text-gray-300 text-sm font-semibold">${year}</div>
                                    </div>
                                    <div class="relative z-10 flex items-center justify-center w-12 h-12 bg-white rounded-full border border-gray-100 shadow-sm flex-shrink-0 group-active:scale-90 transition-transform">
                                        <span class="text-2xl">${event.icon || '📅'}</span>
                                    </div>
                                    <div class="flex-1 pt-1">
                                        <div class="font-bold text-2xl text-black leading-tight mb-0.5">${event.title}</div>
                                        <div class="flex items-baseline gap-2">
                                            <div class="text-gray-400 font-semibold text-xl">
                                                ${days === 0 ? 'Today' : (days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`)}
                                            </div>
                                            ${event.notes ? `<div class="text-sm text-gray-500 italic">${event.notes}</div>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

viewToggle.addEventListener('click', () => {
    if (currentView === 'grid') {
        currentView = 'timeline';
        gridView.classList.add('hidden');
        timelineView.classList.remove('hidden');
        viewIcon.innerText = '⋮☰';
    } else {
        currentView = 'grid';
        gridView.classList.remove('hidden');
        timelineView.classList.add('hidden');
        viewIcon.innerText = '⊞';
    }
});

// Initial render
async function init() {
    if (currentView === 'timeline') {
        gridView.classList.add('hidden');
        timelineView.classList.remove('hidden');
        viewIcon.innerText = '⋮☰';
    } else {
        gridView.classList.remove('hidden');
        timelineView.classList.add('hidden');
        viewIcon.innerText = '⊞';
    }

    if (supabaseClient) {
        try {
            const { data: catData, error: catError } = await supabaseClient.from('categories').select('*');
            if (catError) throw catError;
            if (catData) categories = catData;
            
            const { data: eventData, error: eventError } = await supabaseClient.from('countdown_events').select('*');
            if (eventError) throw eventError;
            if (eventData) events = eventData;
        } catch (err) {
            console.error("Error fetching data from Supabase:", err);
            loadFallbackData();
        }
    } else {
        loadFallbackData();
    }

    renderCategoryFilterBar();
    renderEvents(events);
}

checkUser();
setupAuthListener();
