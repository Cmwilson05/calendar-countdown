// Supabase configuration
const SUPABASE_URL = 'https://qikfgxpbqjzmkjjcxgfr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpa2ZneHBicWp6bWtqamN4Z2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDYzMjUsImV4cCI6MjA4NDQyMjMyNX0.DkvmYMIEfF1GEIyd7s7v1VL0o7Y2h7OIv4ShhgVrQ60';

let supabaseClient;
try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.startsWith('eyJ')) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) {
    console.error("Supabase failed to initialize:", e);
}

// State
let events = [];
let categories = [];
let currentView = 'timeline'; 
let selectedCategoryId = 'all';
let selectedIcon = '🎉';
let editingEventId = null;
let contextEventId = null;
let editingCategoryId = null;
let isReturningToEventModal = false;
let tempSelectedCategoryId = null;
let pickerContext = 'modal';
let sortOption = 'date-asc';
let showNotes = true;
let showDays = true;

// Elements
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
const categoryFilterBar = document.getElementById('categoryFilterBar');
const eventTitleInput = document.getElementById('eventTitle');
const eventNotesInput = document.getElementById('eventNotes');
const eventDateInput = document.getElementById('eventDateInput');
const eventTagsInput = document.getElementById('eventTags');
const eventStarredInput = document.getElementById('eventStarred');
const eventUrlInput = document.getElementById('eventUrl');
const eventMultiDayInput = document.getElementById('eventMultiDay');
const modalCategoryTabs = document.getElementById('modalCategoryTabs');
const emojiPicker = document.getElementById('emojiPicker');
const selectedIconDisplay = document.getElementById('selectedIconDisplay');
const currentEmojiDisplay = document.getElementById('currentEmoji');
const emojiSearch = document.getElementById('emojiSearch');
const emojiList = document.getElementById('emojiList');
const newCategoryEmojiBtn = document.getElementById('newCategoryEmoji');
const newCategoryNameInput = document.getElementById('newCategoryName');
const saveNewCategoryBtn = document.getElementById('saveNewCategory');
const categoriesListEl = document.getElementById('categoriesList');
const contextMenu = document.getElementById('contextMenu');
const menuEdit = document.getElementById('menuEdit');
const menuDelete = document.getElementById('menuDelete');
const menuDuplicate = document.getElementById('menuDuplicate');
const menuNotes = document.getElementById('menuNotes');
const menuStar = document.getElementById('menuStar');
const starLabel = document.getElementById('starLabel');
const menuUpdateIcon = document.getElementById('menuUpdateIcon');
const quickNotesInput = document.getElementById('quickNotesInput');
const saveQuickNotesBtn = document.getElementById('saveQuickNotes');
const cancelQuickNotesBtn = document.getElementById('cancelQuickNotes');
const closeManageCategoriesBtn = document.getElementById('closeManageCategories');
const closeNewEventModalBtn = document.getElementById('closeNewEventModal');
const closeMoreInfoXBtn = document.getElementById('closeMoreInfoX');
const closeQuickNotesXBtn = document.getElementById('closeQuickNotesX');
// const closeContextMenuBtn = document.getElementById('closeContextMenu'); // Removed
const closeEmojiPickerBtn = document.getElementById('closeEmojiPicker');
const viewOptionsBtn = document.getElementById('viewOptionsBtn');
const viewOptionsMenu = document.getElementById('viewOptionsMenu');
const closeViewOptionsBtn = document.getElementById('closeViewOptions');
const toggleNotesCheckbox = document.getElementById('toggleNotes');
const toggleDaysCheckbox = document.getElementById('toggleDays');

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
    { char: '🐲', keywords: 'dragon face', category: 'Animals' }
];

// Auth Logic
async function checkUser() {
    if (!supabaseClient) return;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) showApp(); else showAuth();
}

function setupAuthListener() {
    if (!supabaseClient) return;
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) showApp(); else showAuth();
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
    const { error } = await supabaseClient.auth.signInWithPassword({ 
        email: authEmail.value, 
        password: authPassword.value 
    });
    if (error) {
        authError.innerText = error.message;
        authError.classList.remove('hidden');
    }
});

logoutBtn.addEventListener('click', () => supabaseClient.auth.signOut());

// Data Fetching
async function init() {
    if (currentDateEl) {
        const now = new Date();
        currentDateEl.innerText = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
    }

    updateViewToggleUI();
    
    if (supabaseClient) {
        try {
            const [catRes, eventRes] = await Promise.all([
                supabaseClient.from('categories').select('*'),
                supabaseClient.from('countdown_events').select('*')
            ]);
            
            if (catRes.error) console.error("Categories fetch error:", catRes.error.message);
            if (eventRes.error) console.error("Events fetch error:", eventRes.error.message);

            categories = catRes.data || [];
            events = eventRes.data || [];
            
            renderCategoryFilterBar();
            renderEvents(events);
        } catch (err) {
            console.error("Initialization error:", err);
        }
    }
}

// Event Handlers
saveEventBtn.addEventListener('click', async () => {
    const title = eventTitleInput.value.trim();
    const date = eventDateInput.value;
    if (!title || !date) return alert('Title and Date required');

    const activeTab = modalCategoryTabs.querySelector('.modal-category-tab.bg-blue-600');
    const categoryId = activeTab ? (activeTab.dataset.categoryId === 'none' ? null : activeTab.dataset.categoryId) : null;
    
    const { data: { user } } = await supabaseClient.auth.getUser();

    const eventData = {
        title, 
        date, 
        icon: selectedIcon, 
        category_id: categoryId,
        notes: eventNotesInput.value.trim(),
        tags: eventTagsInput?.value || '',
        starred: eventStarredInput?.checked || false,
        url: eventUrlInput?.value || '',
        multi_day: eventMultiDayInput?.checked || false,
        user_id: user?.id 
    };

    const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
    
    // Optimistic UI update
    if (editingEventId) {
        const idx = events.findIndex(e => (e.id || e.tempId) == editingEventId);
        if (idx !== -1) events[idx] = { ...events[idx], ...eventData };
    } else {
        events.push({ ...eventData, tempId });
    }

    renderEvents(events);
    closeModal();

    if (supabaseClient) {
        const query = editingEventId && !String(editingEventId).startsWith('temp_')
            ? supabaseClient.from('countdown_events').update(eventData).eq('id', editingEventId).select()
            : supabaseClient.from('countdown_events').insert([eventData]).select();
        
        const { data, error } = await query;
        
        if (error) {
            console.error("Supabase Save Error:", error);
            alert(`DATABASE ERROR: ${error.message}\n\nPlease ensure the 'countdown_events' table has all required columns.`);
            init(); // Refresh to clear failed optimistic update
        } else if (data && data.length > 0) {
            const idx = events.findIndex(e => e.tempId === tempId || e.id === editingEventId);
            if (idx !== -1) events[idx] = data[0];
            renderEvents(events);
        } else {
            alert("WARNING: Event saved but server returned no data. Check your Supabase RLS 'SELECT' policies.");
        }
    }
});

// UI Rendering
function renderEvents(eventsToRender) {
    let filtered = eventsToRender;
    if (selectedCategoryId === 'upcoming') filtered = eventsToRender.filter(e => calculateDays(e.date) >= 0);
    else if (selectedCategoryId === 'starred') filtered = eventsToRender.filter(e => e.starred);
    else if (selectedCategoryId !== 'all') filtered = eventsToRender.filter(e => e.category_id == selectedCategoryId);

    // Sorting
    filtered.sort((a, b) => {
        if (sortOption === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortOption === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortOption === 'alpha') return a.title.localeCompare(b.title);
        return 0;
    });

    gridView.innerHTML = filtered.map(event => {
        const days = calculateDays(event.date);
        const cat = categories.find(c => c.id == event.category_id);
        return `
            <div class="bg-blue-500 text-white p-6 rounded-3xl shadow-lg aspect-square flex flex-col justify-between cursor-pointer active:scale-95 transition-transform" 
                 onclick="handleEventClick('${event.id || event.tempId}')">
                <div class="flex justify-between items-start">
                    <div class="text-xl font-bold">${event.title}</div>
                    <div class="text-xl">${cat ? cat.emoji : ''}</div>
                </div>
                <div class="flex flex-col gap-1">
                    <div class="flex items-baseline gap-2">
                        ${showDays ? `<div class="text-3xl font-bold">${Math.abs(days)}</div>` : ''}
                        ${showNotes && event.notes ? `<div class="text-xs opacity-70 line-clamp-2 italic">${event.notes}</div>` : ''}
                    </div>
                    ${showDays ? `<div class="text-sm opacity-80 uppercase tracking-wider">${days === 0 ? 'Today' : (days > 0 ? 'Days Until' : 'Days Since')}</div>` : ''}
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
        return `
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-green-400 mb-6 px-4">${cat ? cat.name : 'Uncategorized'}</h2>
                <div class="relative px-4">
                    <div class="absolute left-[104px] top-0 bottom-0 border-l-2 border-dotted border-green-300"></div>
                    <div class="flex flex-col gap-10">
                        ${catEvents.map(event => {
                            const days = calculateDays(event.date);
                            const d = new Date(event.date);
                            return `
                                <div class="flex items-start gap-6 relative group cursor-pointer" onclick="handleEventClick('${event.id || event.tempId}')">
                                    <div class="w-16 text-right pt-1 flex-shrink-0">
                                        <div class="text-gray-400 font-bold text-xl leading-none mb-1">${d.toLocaleDateString('en-US', {month:'short', day:'numeric'})}</div>
                                        <div class="text-gray-300 text-sm font-semibold">${d.getFullYear()}</div>
                                    </div>
                                    <div class="relative z-10 flex items-center justify-center w-12 h-12 bg-white rounded-full border border-gray-100 shadow-sm flex-shrink-0">
                                        <span class="text-2xl">${event.icon || '📅'}</span>
                                    </div>
                                    <div class="flex-1 pt-1">
                                        <div class="font-bold text-2xl text-black leading-tight mb-0.5">${event.title}</div>
                                        <div class="flex items-baseline gap-2">
                                            ${showDays ? `<div class="text-gray-400 font-semibold text-xl">${days === 0 ? 'Today' : (days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`)}</div>` : ''}
                                            ${showNotes && event.notes ? `<div class="text-sm text-gray-500 italic">${event.notes}</div>` : ''}
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

function renderCategoryFilterBar() {
    const smart = [{id:'upcoming', name:'Upcoming', emoji:'📅'}, {id:'starred', name:'Starred', emoji:'⭐'}, {id:'all', name:'All', emoji:'🌐'}];
    let html = smart.map(f => `
        <button class="filter-tab px-4 py-1.5 rounded-full text-sm font-semibold ${selectedCategoryId === f.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}" data-category-id="${f.id}">
            ${f.emoji} ${f.name}
        </button>
    `).join('');
    html += categories.map(cat => `
        <button class="filter-tab px-4 py-1.5 rounded-full text-sm font-semibold ${selectedCategoryId == cat.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}" data-category-id="${cat.id}">
            ${cat.emoji} ${cat.name}
        </button>
    `).join('');
    html += `<button id="manageCategoriesBtn" class="px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 whitespace-nowrap">+ Edit</button>`;
    categoryFilterBar.innerHTML = html;

    categoryFilterBar.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            selectedCategoryId = tab.dataset.categoryId;
            const f = [...smart, ...categories].find(x => x.id == selectedCategoryId);
            viewTitle.innerText = f ? f.name : 'All';
            renderCategoryFilterBar();
            renderEvents(events);
        });
    });

    document.getElementById('manageCategoriesBtn').onclick = () => openManageCategories();
}

function renderModalCategoryTabs() {
    let html = categories.map(cat => `
        <button class="modal-category-tab flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold" data-category-id="${cat.id}">${cat.name}</button>
    `).join('');
    html += `<button class="modal-category-tab flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold" data-category-id="none">None</button>`;
    html += `<button id="modalManageCategoriesBtn" class="py-1.5 px-3 rounded-lg text-sm font-semibold bg-gray-700 text-white ml-2">⚙️</button>`;
    modalCategoryTabs.innerHTML = html;

    modalCategoryTabs.querySelectorAll('.modal-category-tab').forEach(tab => {
        tab.onclick = () => {
            modalCategoryTabs.querySelectorAll('.modal-category-tab').forEach(t => t.classList.remove('bg-blue-600'));
            tab.classList.add('bg-blue-600');
        };
    });

    document.getElementById('modalManageCategoriesBtn').onclick = (e) => {
        e.stopPropagation();
        const active = modalCategoryTabs.querySelector('.modal-category-tab.bg-blue-600');
        tempSelectedCategoryId = active ? active.dataset.categoryId : null;
        isReturningToEventModal = true;
        newEventModal.classList.add('hidden');
        openManageCategories();
    };
}

function openManageCategories() {
    modalOverlay.classList.remove('hidden');
    manageCategoriesModal.classList.remove('hidden');
    void manageCategoriesModal.offsetWidth;
    manageCategoriesModal.classList.remove('scale-95', 'opacity-0');
    renderCategoriesList();
}

document.getElementById('closeManageCategories').onclick = () => {
    manageCategoriesModal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        manageCategoriesModal.classList.add('hidden');
        if (isReturningToEventModal) {
            newEventModal.classList.remove('hidden');
            renderModalCategoryTabs();
            if (tempSelectedCategoryId) {
                const tab = modalCategoryTabs.querySelector(`[data-category-id="${tempSelectedCategoryId}"]`);
                if (tab) tab.classList.add('bg-blue-600');
            }
            isReturningToEventModal = false;
        } else {
            modalOverlay.classList.add('hidden');
        }
    }, 200);
};

// Helpers
function calculateDays(date) {
    const d = new Date(date); d.setHours(0,0,0,0);
    const now = new Date(); now.setHours(0,0,0,0);
    return Math.ceil((d - now) / 86400000);
}

function updateViewToggleUI() {
    if (currentView === 'grid') {
        gridView.classList.remove('hidden'); timelineView.classList.add('hidden'); viewIcon.innerText = '⊞';
    } else {
        gridView.classList.add('hidden'); timelineView.classList.remove('hidden'); viewIcon.innerText = '⋮☰';
    }
}

viewToggle.onclick = () => {
    currentView = currentView === 'grid' ? 'timeline' : 'grid';
    updateViewToggleUI();
};

function openModal(data = null) {
    editingEventId = data ? (data.id || data.tempId) : null;
    modalOverlay.classList.remove('hidden');
    newEventModal.classList.remove('hidden');
    void newEventModal.offsetWidth;
    newEventModal.classList.remove('scale-95', 'opacity-0');
    renderModalCategoryTabs();
    
    if (data) {
        eventTitleInput.value = data.title;
        eventDateInput.value = data.date;
        eventNotesInput.value = data.notes || '';
        eventTagsInput.value = data.tags || '';
        eventStarredInput.checked = data.starred || false;
        eventUrlInput.value = data.url || '';
        eventMultiDayInput.checked = data.multi_day || false;
        selectedIcon = data.icon || '🎉';
        currentEmojiDisplay.innerText = selectedIcon;
        const tab = modalCategoryTabs.querySelector(`[data-category-id="${data.category_id || 'none'}"]`);
        if (tab) tab.classList.add('bg-blue-600');
    } else {
        eventTitleInput.value = '';
        eventDateInput.value = new Date().toISOString().split('T')[0];
        eventNotesInput.value = '';
        eventTagsInput.value = '';
        eventStarredInput.checked = false;
        eventUrlInput.value = '';
        eventMultiDayInput.checked = false;
        selectedIcon = '🎉';
        currentEmojiDisplay.innerText = '🎉';
        const tab = modalCategoryTabs.querySelector('[data-category-id="none"]');
        if (tab) tab.classList.add('bg-blue-600');
    }
}

function closeModal() {
    newEventModal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modalOverlay.classList.add('hidden');
        newEventModal.classList.add('hidden');
    }, 200);
}

addEventBtn.onclick = () => openModal();
cancelEventBtn.onclick = closeModal;

// Initial Load
checkUser();
setupAuthListener();

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
            renderEvents(events);
        }
    }
    closeContextMenu();
});

menuDuplicate.addEventListener('click', async () => {
    const event = events.find(e => (e.id || e.tempId) == contextEventId);
    if (!event) return;

    const { data: { user } } = await supabaseClient.auth.getUser();

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
        user_id: user?.id
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
        }
    }
    renderEvents(events);
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

function renderCategoriesList() {
    categoriesListEl.innerHTML = categories.map(cat => `
        <div class="flex items-center justify-between bg-[#2c2c2e] p-3 rounded-xl">
            <div class="flex items-center gap-3"><span>${cat.emoji}</span><span>${cat.name}</span></div>
            <div class="flex gap-2">
                <button onclick="editCategory(${cat.id})" class="text-blue-500 font-bold text-sm">Edit</button>
                <button onclick="deleteCategory(${cat.id})" class="text-red-500 font-bold text-sm">Delete</button>
            </div>
        </div>
    `).join('');
}

window.editCategory = (id) => {
    const cat = categories.find(c => c.id == id);
    if (cat) {
        editingCategoryId = id;
        newCategoryNameInput.value = cat.name;
        newCategoryEmojiBtn.innerText = cat.emoji;
        saveNewCategoryBtn.innerText = 'Update';
        newCategoryNameInput.focus();
    }
};

window.deleteCategory = async (id) => {
    if (!confirm('Delete category?')) return;
    if (supabaseClient) {
        const { error } = await supabaseClient.from('categories').delete().eq('id', id);
        if (error) return alert(`Error deleting category: ${error.message}`);
    }
    categories = categories.filter(c => c.id != id);
    renderCategoriesList();
    renderCategoryFilterBar();
};

saveNewCategoryBtn.onclick = async () => {
    const name = newCategoryNameInput.value.trim();
    if (!name) return;
    const { data: { user } } = await supabaseClient.auth.getUser();
    const emoji = newCategoryEmojiBtn.innerText;
    
    if (editingCategoryId) {
        // Update existing
        const index = categories.findIndex(c => c.id == editingCategoryId);
        if (index !== -1) {
            categories[index] = { ...categories[index], name, emoji };
            if (supabaseClient) {
                await supabaseClient.from('categories').update({ name, emoji }).eq('id', editingCategoryId);
            }
        }
        editingCategoryId = null;
        saveNewCategoryBtn.innerText = 'Add';
    } else {
        // Create new
        const newCat = { name, emoji, user_id: user?.id };
        if (supabaseClient) {
            const { data, error } = await supabaseClient.from('categories').insert([newCat]).select();
            if (data && data.length > 0) {
                categories.push(data[0]);
            } else if (error) {
                alert(`Error saving category: ${error.message}`);
            }
        }
    }
    newCategoryNameInput.value = '';
    newCategoryEmojiBtn.innerText = '📁';
    renderCategoriesList();
    renderCategoryFilterBar();
};

// Emoji Picker Logic
function initEmojiPicker() {
    renderEmojis(COMMON_EMOJIS);

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
                selectedIcon = emoji;
                currentEmojiDisplay.innerText = emoji;
            } else if (pickerContext === 'context' && contextEventId) {
                const index = events.findIndex(e => (e.id || e.tempId) == contextEventId);
                if (index !== -1) {
                    events[index].icon = emoji;
                    if (supabaseClient && events[index].id) {
                        await supabaseClient.from('countdown_events').update({ icon: emoji }).eq('id', events[index].id);
                    }
                    renderEvents(events);
                }
                closeContextMenu();
            } else if (pickerContext === 'category') {
                newCategoryEmojiBtn.innerText = emoji;
            }
            emojiPicker.classList.add('hidden');
        });
    });
}

initEmojiPicker();

// Close buttons logic
closeNewEventModalBtn.addEventListener('click', closeModal);
closeMoreInfoXBtn.addEventListener('click', () => {
    moreInfoModal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        moreInfoModal.classList.add('hidden');
        newEventModal.classList.remove('hidden');
        void newEventModal.offsetWidth;
        newEventModal.classList.remove('scale-95', 'opacity-0');
    }, 200);
});
closeQuickNotesXBtn.addEventListener('click', closeModal);
// closeContextMenuBtn.addEventListener('click', closeContextMenu); // Removed
closeEmojiPickerBtn.addEventListener('click', () => emojiPicker.classList.add('hidden'));

// View Options Logic
viewOptionsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    viewOptionsMenu.classList.toggle('hidden');
    if (!viewOptionsMenu.classList.contains('hidden')) {
        viewOptionsMenu.classList.remove('opacity-0');
    } else {
        viewOptionsMenu.classList.add('opacity-0');
    }
});

closeViewOptionsBtn.addEventListener('click', () => {
    viewOptionsMenu.classList.add('opacity-0');
    setTimeout(() => viewOptionsMenu.classList.add('hidden'), 200);
});

document.querySelectorAll('.sort-option').forEach(btn => {
    btn.addEventListener('click', () => {
        sortOption = btn.dataset.sort;
        document.querySelectorAll('.sort-option .check').forEach(c => c.classList.add('hidden'));
        btn.querySelector('.check').classList.remove('hidden');
        
        document.querySelectorAll('.sort-option').forEach(b => {
            b.classList.remove('bg-blue-600', 'text-white');
            b.classList.add('hover:bg-white/10', 'text-gray-300');
        });
        btn.classList.remove('hover:bg-white/10', 'text-gray-300');
        btn.classList.add('bg-blue-600', 'text-white');
        
        renderEvents(events);
    });
});

toggleNotesCheckbox.addEventListener('change', (e) => {
    showNotes = e.target.checked;
    renderEvents(events);
});

toggleDaysCheckbox.addEventListener('change', (e) => {
    showDays = e.target.checked;
    renderEvents(events);
});

document.addEventListener('click', (e) => {
    if (!viewOptionsMenu.classList.contains('hidden') && !viewOptionsMenu.contains(e.target) && !viewOptionsBtn.contains(e.target)) {
        viewOptionsMenu.classList.add('opacity-0');
        setTimeout(() => viewOptionsMenu.classList.add('hidden'), 200);
    }
});

// Escape key logic
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!emojiPicker.classList.contains('hidden')) {
            emojiPicker.classList.add('hidden');
        } else if (!viewOptionsMenu.classList.contains('hidden')) {
            viewOptionsMenu.classList.add('opacity-0');
            setTimeout(() => viewOptionsMenu.classList.add('hidden'), 200);
        } else if (!contextMenu.classList.contains('hidden') && !contextMenu.classList.contains('opacity-0')) {
            closeContextMenu();
        } else if (!manageCategoriesModal.classList.contains('hidden')) {
            closeManageCategoriesBtn.click();
        } else if (!quickNotesModal.classList.contains('hidden')) {
            closeModal();
        } else if (!moreInfoModal.classList.contains('hidden')) {
            closeMoreInfoXBtn.click();
        } else if (!newEventModal.classList.contains('hidden')) {
            closeModal();
        }
    }
});
