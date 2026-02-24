## Design System: DESSERT BEAUTY PREMIUM PINK

### Pattern
- **Name:** Storytelling + Feature-Rich
- **CTA Placement:** Above fold
- **Sections:** Hero > Features > CTA

### Style
- **Name:** Liquid Glass
- **Keywords:** Flowing glass, morphing, smooth transitions, fluid effects, translucent, animated blur, iridescent, chromatic aberration
- **Best For:** Premium SaaS, high-end e-commerce, creative platforms, branding experiences, luxury portfolios
- **Performance:** ⚠ Moderate-Poor | **Accessibility:** ⚠ Text contrast

### Colors
| Role | Hex |
|------|-----|
| Primary | #EC4899 |
| Secondary | #F9A8D4 |
| CTA | #8B5CF6 |
| Background | #FDF2F8 |
| Text | #831843 |

*Notes: Soft pink + lavender luxury*

### Typography
- **Heading:** Playfair Display
- **Body:** Inter
- **Mood:** elegant, luxury, sophisticated, timeless, premium, editorial
- **Best For:** Luxury brands, fashion, spa, beauty, editorial, magazines, high-end e-commerce
- **Google Fonts:** https://fonts.google.com/share?selection.family=Inter:wght@300;400;500;600;700|Playfair+Display:wght@400;500;600;700
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
```

### Key Effects
Morphing elements (SVG/CSS), fluid animations (400-600ms curves), dynamic blur (backdrop-filter), color transitions

### Avoid (Anti-patterns)
- Cheap visuals
- Fast animations

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px

