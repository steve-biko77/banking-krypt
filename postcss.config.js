// postcss.config.js (à la racine du projet)

module.exports = {
  plugins: {
    // 1. Charger Tailwind CSS
    'tailwindcss': {},
    // 2. Charger Autoprefixer
    'autoprefixer': {},
    // S'assurer qu'aucun autre plugin lié à la v4 n'est appelé
  },
}