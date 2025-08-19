# Italian Academies Database

A static React application for exploring the rich history of Italian academies, their members, and works from the Renaissance and early modern periods.
(proof of concept)

## Features

- **Browse Collections**: View lists of academies, people, and works with search and filtering
- **Detailed Views**: Comprehensive detail pages for each item type
- **Cross-References**: Navigate between related items (e.g., academy members, work authors)
- **Image Support**: Display academy emblems, person portraits, and personal emblems
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS
- **Fast Search**: Client-side fuzzy search using Fuse.js
- **No Backend Required**: Fully static site that can be deployed anywhere

## Technology Stack

- **React 18** - UI framework
- **Tanstack Router** - Client-side routing
- **Tanstack Table** - Data tables with sorting and filtering
- **Tanstack Query** - Data fetching and caching
- **Fuse.js** - Fuzzy search functionality
- **Tailwind CSS** - Styling and responsive design
- **Vite** - Build tool and development server

## Project Structure

```
├── data/                    # Source JSON files from XML conversion
│   ├── ItacAcademyItems/   # Individual academy JSON files
│   ├── ItacPersonItems/    # Individual person JSON files
│   └── ItacWorkItems/      # Individual work JSON files
├── public/                 # Built data files and static assets
│   ├── collections/        # Merged collections with pagination
│   ├── items/             # Individual item lookup maps
│   └── images/            # Image files (to be provided)
├── scripts/
│   └── build-data.js      # Data processing script
├── src/
│   ├── routes/            # React components for each route
│   ├── main.jsx          # Application entry point
│   ├── router.js         # Tanstack Router configuration
│   └── index.css         # Global styles
├── xml-to-json.py        # XML to JSON conversion script
└── package.json          # Dependencies and scripts
```

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- Python 3.7+ (for XML conversion)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd italian-academies-database
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Convert XML data to JSON** (if not already done)
   ```bash
   python xml-to-json.py
   ```

4. **Build the data collections**
   ```bash
   npm run build-data
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Data Processing

The application uses a two-step data processing approach:

1. **XML to JSON Conversion** (`xml-to-json.py`): Converts individual XML files to JSON format
2. **Collection Building** (`scripts/build-data.js`): Merges individual JSON files into optimized collections with:
   - Pagination support
   - Search indexes
   - Cross-reference maps
   - Individual item lookup tables

## Image Support

The application expects image files to be placed in `public/images/` with the following naming convention:
- Academy emblems: `{RecordId}_{ImageId}_{version}.jpg`
- Person portraits: `{RecordId}_{ImageId}_{version}.jpg`
- Person emblems: `{RecordId}_{ImageId}_{version}.jpg`

## Routes

- `/` - Home page with collection overview
- `/academies` - List of all academies
- `/academies/{id}` - Academy detail page
- `/people` - List of all people
- `/people/{id}` - Person detail page
- `/works` - List of all works
- `/works/{id}` - Work detail page

## Development

### Adding New Routes

1. Create a new component in `src/routes/`
2. Add the route to `src/routes.js`
3. The router will automatically pick up the new route

### Styling

The application uses Tailwind CSS with custom components defined in `src/index.css`. The design system includes:
- Primary color palette
- Card components
- Button variants
- Form inputs
- Responsive grid layouts

### Data Fetching

All data fetching is handled by Tanstack Query, which provides:
- Automatic caching
- Background refetching
- Loading states
- Error handling

## Deployment

The application is designed to be deployed as a static site. Simply run `npm run build` and deploy the contents of the `dist/` directory to any static hosting service such as:

- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any web server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license information here] 
