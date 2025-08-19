import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Helper function to read all JSON files from a directory
function readJsonFiles(dirPath) {
    const files = fs.readdirSync(dirPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    return jsonFiles.map(file => {
        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    });
}

// Helper function to extract the main item from JSON structure
function extractItem(jsonData) {
    const keys = Object.keys(jsonData);
    return jsonData[keys[0]]; // Get the first (and usually only) key
}

// Helper function to create searchable text
function createSearchText(item, type) {
    let text = '';

    switch (type) {
        case 'academy':
            text = `${item.Name || ''} ${item.AlternativeName || ''} ${item.Motto || ''} ${item.City?.CityItalianName || ''} ${item.City?.CityEnglishName || ''}`;
            break;
        case 'person':
            text = `${item.Surname || ''} ${item.Forename || ''} ${item.PersonalTitle || ''} ${item.Nationality?.Value || ''} ${item.Role || ''}`;
            break;
        case 'work':
            text = `${item.ShortTitle || ''} ${item.LongTitle || ''} ${item.Subjects || ''} ${item.Language || ''} ${item.City?.PublicationPlaceItalianName || ''}`;
            break;
    }

    return text.toLowerCase().trim();
}

// Process academies first
console.log('Processing academies...');
const academyFiles = readJsonFiles(path.join(DATA_DIR, 'ItacAcademyItems'));
const academies = academyFiles.map(file => {
    const item = extractItem(file);

    // Sort academy members alphabetically by name if they exist
    if (item.ItacPersonItem) {
        const members = Array.isArray(item.ItacPersonItem)
            ? item.ItacPersonItem
            : [item.ItacPersonItem];

        // Sort members alphabetically by Name field
        const sortedMembers = members.sort((a, b) => {
            const nameA = (a.Name || '').toLowerCase();
            const nameB = (b.Name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });

        // Update the academy with sorted members
        item.ItacPersonItem = sortedMembers;
    }

    return {
        ...item,
        searchText: createSearchText(item, 'academy'),
        type: 'academy'
    };
});

// Create lite version of academies for collections (without member data)
const academiesLite = academies.map(academy => {
    const { ItacPersonItem, Citation, Notes, ...liteAcademy } = academy;
    return {
        ...liteAcademy,
        memberCount: ItacPersonItem ? (Array.isArray(ItacPersonItem) ? ItacPersonItem.length : 1) : 0
    };
});

// Process people and enrich with academy data
console.log('Processing people...');
const personFiles = readJsonFiles(path.join(DATA_DIR, 'ItacPersonItems'));
const people = personFiles.map(file => {
    const item = extractItem(file);

    // Initialize enriched person data
    const enrichedPerson = {
        ...item,
        searchText: createSearchText(item, 'person'),
        type: 'person',
        academyMemberships: [],
        PersonPortraitImage: null,
        PersonEmblemImage: null,
        PersonEmblemDescription: null,
        Nickname: null,
        Motto: null
    };

    // Find this person in academy member lists and collect their data
    academies.forEach(academy => {
        if (academy.ItacPersonItem) {
            const members = Array.isArray(academy.ItacPersonItem)
                ? academy.ItacPersonItem
                : [academy.ItacPersonItem];

            const memberData = members.find(member => member.RecordId === item.RecordId);

            if (memberData) {
                // Add academy membership
                enrichedPerson.academyMemberships.push({
                    academyId: academy.AcademyId,
                    academyRecordId: academy.RecordId,
                    academyName: academy.Name,
                    academyCity: academy.City?.CityItalianName || academy.City?.CityEnglishName
                });

                // Collect portrait and emblem data (take the first one found)
                if (memberData.PersonPortraitImage && !enrichedPerson.PersonPortraitImage) {
                    enrichedPerson.PersonPortraitImage = memberData.PersonPortraitImage;
                }

                if (memberData.PersonEmblemImage && !enrichedPerson.PersonEmblemImage) {
                    enrichedPerson.PersonEmblemImage = memberData.PersonEmblemImage;
                }

                if (memberData.PersonEmblemDescription && !enrichedPerson.PersonEmblemDescription) {
                    enrichedPerson.PersonEmblemDescription = memberData.PersonEmblemDescription;
                }

                if (memberData.Nickname && !enrichedPerson.Nickname) {
                    enrichedPerson.Nickname = memberData.Nickname;
                }

                if (memberData.Motto && !enrichedPerson.Motto) {
                    enrichedPerson.Motto = memberData.Motto;
                }
            }
        }
    });

    return enrichedPerson;
});

// Process works
console.log('Processing works...');
const workFiles = readJsonFiles(path.join(DATA_DIR, 'ItacWorkItems'));
const works = workFiles.map(file => {
    const item = extractItem(file);
    return {
        ...item,
        searchText: createSearchText(item, 'work'),
        type: 'work'
    };
});

// Create lite version of people for collections (without heavy fields)
const peopleLite = people.map(person => {
    const {
        PersonPortraitImage,
        PersonEmblemImage,
        PersonEmblemDescription,
        academyMemberships,
        Motto,
        Notes,
        Citation,
        ...litePerson
    } = person;
    return litePerson;
});

// Create lite version of works for collections (without heavy fields)
const worksLite = works.map(work => {
    const {
        ItacPersonItem,
        Notes,
        Citation,
        ...liteWork
    } = work;
    return liteWork;
});

// Create paginated collections
function createPaginatedCollection(items, itemsPerPage = 50) {
    const pages = [];
    for (let i = 0; i < items.length; i += itemsPerPage) {
        pages.push(items.slice(i, i + itemsPerPage));
    }

    return {
        items,
        pages,
        totalItems: items.length,
        totalPages: pages.length,
        itemsPerPage
    };
}

// Create collections with pagination
const academyCollection = createPaginatedCollection(academiesLite);
const peopleCollection = createPaginatedCollection(peopleLite);
const workCollection = createPaginatedCollection(worksLite);

// Create individual item lookup maps
const academyMap = {};
academies.forEach(academy => {
    academyMap[academy.RecordId] = academy;
});

const peopleMap = {};
people.forEach(person => {
    peopleMap[person.RecordId] = person;
});

const workMap = {};
works.forEach(work => {
    workMap[work.RecordId] = work;
});

// Write collections to public directory
console.log('Writing collections...');

// Write paginated collections
fs.writeFileSync(
    path.join(PUBLIC_DIR, 'collections/academies.json'),
    JSON.stringify(academyCollection, null, 2)
);

fs.writeFileSync(
    path.join(PUBLIC_DIR, 'collections/people.json'),
    JSON.stringify(peopleCollection, null, 2)
);

fs.writeFileSync(
    path.join(PUBLIC_DIR, 'collections/works.json'),
    JSON.stringify(workCollection, null, 2)
);

// Write individual item maps for quick lookup
fs.writeFileSync(
    path.join(PUBLIC_DIR, 'items/academies.json'),
    JSON.stringify(academyMap, null, 2)
);

fs.writeFileSync(
    path.join(PUBLIC_DIR, 'items/people.json'),
    JSON.stringify(peopleMap, null, 2)
);

fs.writeFileSync(
    path.join(PUBLIC_DIR, 'items/works.json'),
    JSON.stringify(workMap, null, 2)
);

// Create collections index
const collectionsIndex = {
    academies: {
        count: academies.length,
        name: 'Academies',
        description: 'Italian academies and their members'
    },
    people: {
        count: people.length,
        name: 'People',
        description: 'Members and associates of Italian academies'
    },
    works: {
        count: works.length,
        name: 'Works',
        description: 'Publications and works related to Italian academies'
    }
};

fs.writeFileSync(
    path.join(PUBLIC_DIR, 'collections/index.json'),
    JSON.stringify(collectionsIndex, null, 2)
);

console.log('Build complete!');
console.log(`- Academies: ${academies.length} items`);
console.log(`- People: ${people.length} items`);
console.log(`- Works: ${works.length} items`);

// Log enrichment statistics
const peopleWithPortraits = people.filter(p => p.PersonPortraitImage).length;
const peopleWithEmblems = people.filter(p => p.PersonEmblemImage).length;
const peopleWithMemberships = people.filter(p => p.academyMemberships.length > 0).length;

console.log('\nEnrichment Statistics:');
console.log(`- People with portraits: ${peopleWithPortraits}`);
console.log(`- People with emblems: ${peopleWithEmblems}`);
console.log(`- People with academy memberships: ${peopleWithMemberships}`); 