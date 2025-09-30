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

// Helper function to normalize all ID property names for consistency
function normalizeIdProperties(item) {
    if (!item || typeof item !== 'object') return item;

    // Normalize RecordID -> RecordId
    if (item.RecordID && !item.RecordId) {
        item.RecordId = item.RecordID;
        delete item.RecordID;
    }

    // Normalize AcademyID -> AcademyId
    if (item.AcademyID && !item.AcademyId) {
        item.AcademyId = item.AcademyID;
        delete item.AcademyID;
    }

    // Normalize PersonID -> PersonId
    if (item.PersonID && !item.PersonId) {
        item.PersonId = item.PersonID;
        delete item.PersonID;
    }

    // Normalize WorkID -> WorkId
    if (item.WorkID && !item.WorkId) {
        item.WorkId = item.WorkID;
        delete item.WorkID;
    }

    // Normalize CityID -> CityId
    if (item.CityID && !item.CityId) {
        item.CityId = item.CityID;
        delete item.CityID;
    }

    // Normalize NationalityID -> NationalityId
    if (item.NationalityID && !item.NationalityId) {
        item.NationalityId = item.NationalityID;
        delete item.NationalityID;
    }

    // Normalize ImageID -> ImageId
    if (item.ImageID && !item.ImageId) {
        item.ImageId = item.ImageID;
        delete item.ImageID;
    }

    // Recursively normalize nested objects
    for (const key in item) {
        if (item[key] && typeof item[key] === 'object') {
            if (Array.isArray(item[key])) {
                item[key].forEach(normalizeIdProperties);
            } else {
                normalizeIdProperties(item[key]);
            }
        }
    }

    return item;
}

// Process academies first
console.log('Processing academies...');
const academyFiles = readJsonFiles(path.join(DATA_DIR, 'ItacAcademyItems'));
const academies = academyFiles.map(file => {
    const item = extractItem(file);
    const normalizedItem = normalizeIdProperties(item);

    // Sort academy members alphabetically by name if they exist
    if (normalizedItem.ItacPersonItem) {
        const members = Array.isArray(normalizedItem.ItacPersonItem)
            ? normalizedItem.ItacPersonItem
            : [normalizedItem.ItacPersonItem];

        // Sort members alphabetically by Name field
        const sortedMembers = members.sort((a, b) => {
            const nameA = (a.Name || '').toLowerCase();
            const nameB = (b.Name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });

        // Update the academy with sorted members
        normalizedItem.ItacPersonItem = sortedMembers;
    }

    return {
        ...normalizedItem,
        searchText: createSearchText(normalizedItem, 'academy'),
        type: 'academy'
    };
});

// Create academies with member count for search index (keep member data for detail pages)
const academiesWithCount = academies.map(academy => {
    const { Citation, Notes, ...academyData } = academy;
    return {
        ...academyData,
        memberCount: academy.ItacPersonItem ? (Array.isArray(academy.ItacPersonItem) ? academy.ItacPersonItem.length : 1) : 0
    };
});

// Process people and enrich with academy data
console.log('Processing people...');
const personFiles = readJsonFiles(path.join(DATA_DIR, 'ItacPersonItems'));
const people = personFiles.map(file => {
    const item = extractItem(file);
    const normalizedItem = normalizeIdProperties(item);

    // Initialize enriched person data
    const enrichedPerson = {
        ...normalizedItem,
        searchText: createSearchText(normalizedItem, 'person'),
        type: 'person',
        academyMemberships: [],
        relatedWorks: [],
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
    const normalizedItem = normalizeIdProperties(item);
    return {
        ...normalizedItem,
        searchText: createSearchText(normalizedItem, 'work'),
        type: 'work'
    };
});

// Add related works to people
console.log('Adding related works to people...');
people.forEach(person => {
    const workRolesMap = new Map() // Track roles per work to combine duplicates

    works.forEach(work => {
        // Check if this person appears in any relationship field
        const relationshipFields = ['Censors', 'Dedicatees', 'Editors', 'Artists', 'Illustrators', 'Printers']

        relationshipFields.forEach(role => {
            const fieldData = work[role]
            if (!fieldData || !fieldData.ItacPersonItem) return

            const persons = Array.isArray(fieldData.ItacPersonItem)
                ? fieldData.ItacPersonItem
                : [fieldData.ItacPersonItem]

            const hasRelationship = persons.some(p => p.RecordId === person.RecordId)

            if (hasRelationship) {
                // Convert plural role to singular
                const singularRole = role.toLowerCase().replace(/s$/, '')

                const workId = work.RecordId

                if (workRolesMap.has(workId)) {
                    // Combine roles for the same work
                    const existing = workRolesMap.get(workId)
                    if (!existing.roles.includes(singularRole)) {
                        existing.roles.push(singularRole)
                    }
                } else {
                    // First role for this work
                    workRolesMap.set(workId, {
                        id: work.RecordId,
                        title: work.ShortTitle || work.LongTitle || 'Untitled',
                        language: work.Language || '-',
                        publicationPlace: work.City?.PublicationPlaceItalianName || work.City?.PublicationPlaceEnglishName || '-',
                        roles: [singularRole]
                    })
                }
            }
        })
    })

    // Convert map to array and join roles with commas
    person.relatedWorks = Array.from(workRolesMap.values()).map(work => ({
        ...work,
        role: work.roles.join(', ')
    }))
})

console.log('Related works added to people!')

// Lite versions are no longer needed - we use individual files

// Paginated collections are no longer needed

// Individual item lookup maps are no longer needed

// Collections are no longer needed - we use search indices and individual files

// Individual item maps are no longer needed - we use individual files

// Create individual item files for on-demand loading
console.log('Creating individual item files...');

// Create directories for individual items
const createIndividualItemFiles = (items, collectionName) => {
    const itemDir = path.join(PUBLIC_DIR, 'items', collectionName);
    if (!fs.existsSync(itemDir)) {
        fs.mkdirSync(itemDir, { recursive: true });
    }

    items.forEach(item => {
        const filePath = path.join(itemDir, `${item.RecordId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(item, null, 2));
    });

    console.log(`Created ${items.length} individual ${collectionName} files`);
};

createIndividualItemFiles(academiesWithCount, 'academies');
createIndividualItemFiles(people, 'people');
createIndividualItemFiles(works, 'works');

// Collections index is no longer needed - counts are derived from search indices

// Create search indices for Fuse.js
console.log('Creating search indices...');

// Ensure search directory exists
const searchDir = path.join(PUBLIC_DIR, 'search');
if (!fs.existsSync(searchDir)) {
    fs.mkdirSync(searchDir, { recursive: true });
}

// Create lightweight search indices
const createSearchIndex = (items, type) => {
    return items.map(item => {
        const baseIndex = {
            id: item.RecordId,
            searchText: item.searchText,
            // Include minimal data needed for display
            name: item.Name || item.ShortTitle || `${item.Surname || ''}, ${item.Forename || ''}`.trim()
        };

        // Add type-specific fields
        if (type === 'person') {
            return {
                ...baseIndex,
                title: item.PersonalTitle || '-',
                lifespan: item.DateText || '-',
                nationality: item.Nationality?.Value || '-'
            };
        }

        if (type === 'academy') {
            return {
                ...baseIndex,
                city: item.City?.CityItalianName || '-',
                startDate: item.StartDate || '-',
                endDate: item.EndDate || '-',
                motto: item.Motto || '-',
                memberCount: item.memberCount || 0
            };
        }

        if (type === 'work') {
            return {
                ...baseIndex,
                language: item.Language || '-',
                publicationPlace: item.City?.PublicationPlaceItalianName || '-',
                publicationDate: item.DateText || '-',
                subjects: Array.isArray(item.Subjects) ? item.Subjects.join(', ') : (item.Subjects || '-')
            };
        }

        return baseIndex;
    });
};

const academySearchIndex = createSearchIndex(academiesWithCount, 'academy');
const peopleSearchIndex = createSearchIndex(people, 'person');
const workSearchIndex = createSearchIndex(works, 'work');

// Write search indices to files
fs.writeFileSync(
    path.join(PUBLIC_DIR, 'search/academies.json'),
    JSON.stringify(academySearchIndex, null, 2)
);

fs.writeFileSync(
    path.join(PUBLIC_DIR, 'search/people.json'),
    JSON.stringify(peopleSearchIndex, null, 2)
);

fs.writeFileSync(
    path.join(PUBLIC_DIR, 'search/works.json'),
    JSON.stringify(workSearchIndex, null, 2)
);

// Create a combined search index for global search
const combinedSearchIndex = [
    ...academySearchIndex.map(item => ({ ...item, collection: 'academies' })),
    ...peopleSearchIndex.map(item => ({ ...item, collection: 'people' })),
    ...workSearchIndex.map(item => ({ ...item, collection: 'works' }))
];

fs.writeFileSync(
    path.join(PUBLIC_DIR, 'search/combined.json'),
    JSON.stringify(combinedSearchIndex, null, 2)
);

console.log('Search indices created!');

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