export function getEffectiveDate(event) {
    if (!event.date) return new Date();
    let target = new Date(event.date + 'T00:00:00');
    
    if (!event.repeat || event.repeat === 'never') return target;
    
    const now = new Date(); 
    now.setHours(0,0,0,0);
    
    if (target >= now) return target;

    // Optimized math to prevent browser crashing on old dates
    if (event.repeat === 'daily') {
        const diffTime = now - target;
        const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (daysSince > 0) target.setDate(target.getDate() + daysSince + 1);
    } else {
        // Fallback for other intervals
        while (target < now) {
            if (event.repeat === 'weekly') target.setDate(target.getDate() + 7);
            else if (event.repeat === 'monthly') target.setMonth(target.getMonth() + 1);
            else if (event.repeat === 'yearly') target.setFullYear(target.getFullYear() + 1);
            else break;
        }
    }
    return target;
}

export function calculateDays(dateObjOrString) {
    const target = dateObjOrString instanceof Date ? dateObjOrString : new Date(dateObjOrString + 'T00:00:00');
    const now = new Date();
    now.setHours(0,0,0,0);
    const diff = target - now;
    return Math.ceil(diff / 86400000); // 86400000 = ms in a day
}

export function toTitleCase(str) {
    if (!str) return str;
    const smallWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'of', 'in', 'vs'];
    return str.toLowerCase().split(' ').map((word, index) => {
        if (!word) return word;
        if (index === 0 || !smallWords.includes(word)) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
    }).join(' ');
}
