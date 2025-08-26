# 🎨 Color Palette Generator

Extract dominant colors from any image with intelligent anti-palette clash detection. A smart tool for designers, developers, and creatives who need perfect color combinations.

## ✨ Features

- **🧠 Smart Color Extraction** - Uses k-means clustering algorithm for accurate dominant color detection
- **⚠️ Anti-Palette Generation** - Identifies clashing colors to avoid using color theory principles
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices
- **🖱️ Drag & Drop Upload** - Simply drag images or click to upload
- **📋 One-Click Copy** - Click any color to copy hex code to clipboard
- **🎛️ Flexible Palette Sizes** - Generate 5, 8, or 10 color palettes
- **💾 Export Functionality** - Save both main and anti-palette data as JSON
- **🎯 Multiple Color Formats** - View both HEX and RGB values

## 🚀 Live Demo

**[Try it live!](https://aquadantheman.github.io/color-palette-generator/)**

## 🛠️ How It Works

### Color Extraction
1. **Image Processing** - Scales and samples image pixels using HTML5 Canvas
2. **K-Means Clustering** - Groups similar colors to find dominant hues
3. **Smart Sorting** - Orders colors by brightness for visual appeal

### Anti-Palette Detection
The anti-palette feature uses color theory to identify problematic color combinations:
- **Direct Complements** - Colors that fight for attention
- **Muddy Combinations** - Hue shifts that create visual discord
- **Poor Contrast** - Colors too similar in brightness
- **Saturation Clashes** - Combinations that strain the eye

## 💻 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Image Processing**: HTML5 Canvas API
- **Algorithms**: K-means clustering, Euclidean distance
- **Styling**: Modern CSS with gradients, animations, and responsive design
- **File Handling**: FileReader API with drag/drop support

## 🎯 Use Cases

- **Web Design** - Extract brand colors from logos or photos
- **UI/UX Design** - Generate cohesive color schemes
- **Brand Development** - Ensure color harmony in marketing materials
- **Digital Art** - Find complementary palettes for artwork
- **Accessibility** - Avoid problematic color combinations

## 🚀 Getting Started

### Option 1: Use Online
Simply visit the [live demo](https://aquadantheman.github.io/color-palette-generator/) and start uploading images!

### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/Aquadantheman/color-palette-generator.git

# Navigate to the project directory
cd color-palette-generator

# Open index.html in your browser
open index.html
```

## 🎮 Usage

1. **Upload Image** - Drag & drop or click to select an image file
2. **Generate Palette** - Choose 5, 8, or 10 colors
3. **View Results** - See dominant colors with hex and RGB values
4. **Check Anti-Palette** - Click "⚠️ Anti-Palette" to see colors to avoid
5. **Copy Colors** - Click any color swatch to copy hex code
6. **Export Data** - Save palette information as JSON

## 🎨 Screenshots

### Main Palette
Beautiful, responsive color swatches showing the dominant colors from your image.

### Anti-Palette
Unique feature showing problematic color combinations with visual warnings.

### Update
# 🎨 Color Palette Generator (React + Tailwind)

Extract dominant colors, hover a loupe to preview pixel color, click to sample and copy, build anti-palettes (Complement vs Low-contrast), compare two images, and export JSON/CSS.

## Quick start

```bash
npm i
npm run dev


## 🤝 Contributing

Contributions are welcome! Here are some ideas for enhancements:

- **Color Harmony Suggestions** (complementary, triadic, analogous)
- **Export to Popular Formats** (Adobe Swatches, CSS, SCSS)
- **Color Accessibility Checker** (WCAG contrast ratios)
- **Palette History** (save/load previous palettes)
- **Social Sharing** (share palettes with others)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙋‍♂️ Author

**Aquadantheman** - [GitHub Profile](https://github.com/Aquadantheman)

---

⭐ **Star this repo** if you found it helpful! 

🐛 **Found a bug?** [Open an issue](https://github.com/Aquadantheman/color-palette-generator/issues)

💡 **Have an idea?** [Start a discussion](https://github.com/Aquadantheman/color-palette-generator/discussions)
