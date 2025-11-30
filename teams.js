// F1 Team Data and Colors (2024/2025 Season)

const F1_TEAMS = {
    'Red Bull Racing': {
        id: 'redbull',
        color: '#3671C6',
        accent: '#FFC906',
        name: 'Red Bull Racing',
        drivers: ['VER', 'PER']
    },
    'Ferrari': {
        id: 'ferrari',
        color: '#E8002D',
        accent: '#FFF000',
        name: 'Ferrari',
        drivers: ['LEC', 'SAI']
    },
    'Mercedes': {
        id: 'mercedes',
        color: '#27F4D2',
        accent: '#000000',
        name: 'Mercedes',
        drivers: ['HAM', 'RUS']
    },
    'McLaren': {
        id: 'mclaren',
        color: '#FF8000',
        accent: '#47C7FC',
        name: 'McLaren',
        drivers: ['NOR', 'PIA']
    },
    'Aston Martin': {
        id: 'astonmartin',
        color: '#229971',
        accent: '#C1FD35',
        name: 'Aston Martin',
        drivers: ['ALO', 'STR']
    },
    'Alpine': {
        id: 'alpine',
        color: '#FF87BC',
        accent: '#2293D1',
        name: 'Alpine',
        drivers: ['GAS', 'OCO']
    },
    'Williams': {
        id: 'williams',
        color: '#64C4FF',
        accent: '#041E42',
        name: 'Williams',
        drivers: ['ALB', 'SAR']
    },
    'RB': {
        id: 'rb',
        color: '#6692FF',
        accent: '#FFFFFF',
        name: 'RB',
        drivers: ['TSU', 'RIC']
    },
    'Sauber': {
        id: 'sauber',
        color: '#52E252',
        accent: '#000000',
        name: 'Sauber',
        drivers: ['BOT', 'ZHO']
    },
    'Haas': {
        id: 'haas',
        color: '#B6BABD',
        accent: '#DC0000',
        name: 'Haas F1 Team',
        drivers: ['MAG', 'HUL']
    }
};

// F1 Dictionary/Glossary
const F1_DICTIONARY = {
    'Undercut': {
        term: 'Undercut',
        definition: 'A strategic pit stop made before your rival, allowing you to gain track position by running faster laps on fresh tires while they remain on older, slower tires.',
        example: 'If Hamilton pits on lap 20 and Verstappen pits on lap 22, Hamilton may exit ahead after Verstappen\'s stop.'
    },
    'Overcut': {
        term: 'Overcut',
        definition: 'Staying out on track longer than your rival before pitting, using track position and clear air to build a gap that allows you to rejoin ahead after your stop.',
        example: 'Extending your stint by 3-4 laps while others pit can give you clearer track and faster laps.'
    },
    'DRS': {
        term: 'DRS (Drag Reduction System)',
        definition: 'A moveable rear wing element that reduces drag and increases top speed. Available when within 1 second of the car ahead in designated zones.',
        example: 'Activated automatically in DRS zones when you\'re close enough to overtake.'
    },
    'ERS': {
        term: 'ERS (Energy Recovery System)',
        definition: 'Hybrid system that harvests energy from braking (MGU-K) and exhaust heat (MGU-H), storing it in a battery for power boosts.',
        example: 'Drivers manage ERS deployment for overtaking or defending.'
    },
    'VSC': {
        term: 'VSC (Virtual Safety Car)',
        definition: 'A speed limit imposed across the track when there\'s a hazard. All drivers must maintain a delta time, preventing strategic advantages.',
        example: 'Used for debris or minor incidents that don\'t require a full Safety Car.'
    },
    'Safety Car': {
        term: 'Safety Car',
        definition: 'A physical car that leads the pack at reduced speed during dangerous track conditions, bunching up the field.',
        example: 'Deployed for serious incidents or when track work is needed.'
    },
    'Red Flag': {
        term: 'Red Flag',
        definition: 'Session stoppage where all cars must return to the pits. Used for serious accidents or dangerous conditions.',
        example: 'Heavy rain or major crashes can cause a red flag.'
    },
    'Tire Compounds': {
        term: 'Tire Compounds',
        definition: 'Pirelli provides three compounds per race: Soft (fastest, least durable), Medium (balanced), and Hard (slowest, most durable).',
        example: 'Softs for qualifying, hards for long race stints.'
    },
    'Box': {
        term: 'Box / Box Box',
        definition: 'Radio call telling a driver to pit (enter the pit lane). Comes from the German word "boxenstopp".',
        example: '"Box this lap, box box" means pit immediately.'
    },
    'Delta': {
        term: 'Delta',
        definition: 'The time difference between a driver\'s current pace and a reference lap time or target.',
        example: 'During VSC, drivers must stay within a positive delta (slower than target).'
    },
    'Graining': {
        term: 'Graining',
        definition: 'When tire surface temperature is too low, causing rubber to tear and bunch up, reducing grip.',
        example: 'Cold track conditions can cause tire graining early in stints.'
    },
    'Blistering': {
        term: 'Blistering',
        definition: 'When tires overheat, causing the rubber to separate from the carcass, forming bubbles.',
        example: 'Hot tracks and aggressive driving can cause blistering.'
    },
    'Track Limits': {
        term: 'Track Limits',
        definition: 'Defined boundaries of the racing surface. Exceeding them (all four wheels off) can result in lap time deletion or penalties.',
        example: 'Cutting corners repeatedly leads to warnings then penalties.'
    },
    'Parc Fermé': {
        term: 'Parc Fermé',
        definition: 'A restricted area where cars are held after qualifying and races. No setup changes allowed between quali and race.',
        example: 'Cars are locked in parc fermé conditions after qualifying.'
    }
};

