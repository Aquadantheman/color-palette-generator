# 🎨 Color Palette Generator (React + Tailwind)

Extract dominant colors from any image, preview pixels with a live loupe, click to sample, and automatically build palettes with clash detection.  
Compare two images side-by-side, generate “anti-palettes” (complementary or low-contrast colors to avoid), and export your palettes in multiple formats.

---

## 🚀 Live Demo
👉 [Try it here](https://aquadantheman.github.io/color-palettes/)

---

## ✨ Features

- **🧠 Smart Color Extraction**  
  Uses k-means clustering in perceptual Lab color space for accurate dominant colors.

- **⚠️ Anti-Palette Generation**  
  Identifies clashing colors using complementary and low-contrast detection.

- **🔍 Pixel Loupe & Sampling**  
  Hover to preview any pixel’s HEX/RGB, click to sample and copy.

- **📊 Image Comparison Mode**  
  Compare palettes from two images, get compatibility score + bridge colors.

- **📋 One-Click Copy**  
  Click any swatch to copy its HEX code instantly.

- **💾 Export Options**  
  Save palettes as **JSON** or export as **CSS variables**.

- **📱 Responsive Design**  
  Built with Tailwind, works seamlessly on desktop and mobile.

---

## 🖼️ How It Works

1. **Image Processing** – Your image is downscaled and drawn to an HTML5 canvas.  
2. **K-Means Clustering** – Colors are grouped into k clusters (5, 8, or 10).  
3. **Palette Sorting** – Colors are ordered by hue, saturation, and brightness for consistency.  
4. **Anti-Palette Detection** – Generates either:
   - **Complements** (colors that fight for attention), or  
   - **Low-Contrast Neighbors** (colors that reduce text/UI readability).  
5. **Comparison** – Two images’ palettes are analyzed using ΔE distance in Lab color space, with bridge colors suggested for harmony.  
6. **Loupe & Sampling** – The live loupe magnifies pixels so you can precisely pick any color.

---

## 💻 Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)  
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)  
- **Algorithms**: K-Means clustering, CIELAB ΔE distance, WCAG luminance contrast  
- **Image Handling**: HTML5 Canvas API  
- **Build & Deploy**: GitHub Actions → GitHub Pages

---

## 🎯 Use Cases

- **Web & UI/UX Design** – Extract brand or theme colors from logos, screenshots, or mockups.  
- **Digital Art** – Find complementary palettes for your artwork.  
- **Brand Development** – Ensure harmony and avoid color clashes in marketing materials.  
- **Accessibility Testing** – Detect colors that may fail WCAG contrast standards.  
- **Creative Exploration** – Quickly generate inspiration palettes from photos.

---

## 🛠️ Getting Started

### Run Locally
```bash
# Clone the repository
git clone https://github.com/Aquadantheman/color-palettes.git

# Navigate to the project directory
cd color-palettes

# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
