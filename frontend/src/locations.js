/**
 * locations.js
 * ------------
 * Pre-defined canonical Google location strings for the datalist dropdown.
 *
 * Format: "City,Region,Country"  — this is the exact format the UULE encoder
 * expects on the backend.  Users may also type a custom location string.
 *
 * @type {Array<{label: string, value: string}>}
 */
const LOCATIONS = [
  // North America
  { label: "New York, USA", value: "New York,New York,United States" },
  { label: "Los Angeles, USA", value: "Los Angeles,California,United States" },
  { label: "Chicago, USA", value: "Chicago,Illinois,United States" },
  { label: "Houston, USA", value: "Houston,Texas,United States" },
  { label: "San Francisco, USA", value: "San Francisco,California,United States" },
  { label: "Seattle, USA", value: "Seattle,Washington,United States" },
  { label: "Boston, USA", value: "Boston,Massachusetts,United States" },
  { label: "Miami, USA", value: "Miami,Florida,United States" },
  { label: "Toronto, Canada", value: "Toronto,Ontario,Canada" },
  { label: "Vancouver, Canada", value: "Vancouver,British Columbia,Canada" },
  { label: "Mexico City, Mexico", value: "Mexico City,Mexico City,Mexico" },

  // Europe
  { label: "London, UK", value: "London,England,United Kingdom" },
  { label: "Manchester, UK", value: "Manchester,England,United Kingdom" },
  { label: "Berlin, Germany", value: "Berlin,Berlin,Germany" },
  { label: "Munich, Germany", value: "Munich,Bavaria,Germany" },
  { label: "Paris, France", value: "Paris,Ile-de-France,France" },
  { label: "Amsterdam, Netherlands", value: "Amsterdam,North Holland,Netherlands" },
  { label: "Madrid, Spain", value: "Madrid,Community of Madrid,Spain" },
  { label: "Barcelona, Spain", value: "Barcelona,Catalonia,Spain" },
  { label: "Rome, Italy", value: "Rome,Lazio,Italy" },
  { label: "Milan, Italy", value: "Milan,Lombardy,Italy" },
  { label: "Stockholm, Sweden", value: "Stockholm,Stockholm County,Sweden" },
  { label: "Oslo, Norway", value: "Oslo,Oslo,Norway" },
  { label: "Warsaw, Poland", value: "Warsaw,Masovian Voivodeship,Poland" },
  { label: "Zurich, Switzerland", value: "Zurich,Zurich,Switzerland" },
  { label: "Istanbul, Turkey", value: "Istanbul,Istanbul,Turkey" },
  { label: "Ankara, Turkey", value: "Ankara,Ankara,Turkey" },

  // Asia-Pacific
  { label: "Tokyo, Japan", value: "Tokyo,Tokyo,Japan" },
  { label: "Osaka, Japan", value: "Osaka,Osaka,Japan" },
  { label: "Singapore", value: "Singapore,Singapore,Singapore" },
  { label: "Sydney, Australia", value: "Sydney,New South Wales,Australia" },
  { label: "Melbourne, Australia", value: "Melbourne,Victoria,Australia" },
  { label: "Mumbai, India", value: "Mumbai,Maharashtra,India" },
  { label: "Delhi, India", value: "New Delhi,Delhi,India" },
  { label: "Bangalore, India", value: "Bangalore,Karnataka,India" },
  { label: "Jakarta, Indonesia", value: "Jakarta,Jakarta,Indonesia" },
  { label: "Seoul, South Korea", value: "Seoul,Seoul,South Korea" },
  { label: "Bangkok, Thailand", value: "Bangkok,Bangkok,Thailand" },
  { label: "Kuala Lumpur, Malaysia", value: "Kuala Lumpur,Federal Territory,Malaysia" },

  // Middle East & Africa
  { label: "Dubai, UAE", value: "Dubai,Dubai,United Arab Emirates" },
  { label: "Riyadh, Saudi Arabia", value: "Riyadh,Riyadh,Saudi Arabia" },
  { label: "Tel Aviv, Israel", value: "Tel Aviv,Tel Aviv District,Israel" },
  { label: "Cairo, Egypt", value: "Cairo,Cairo,Egypt" },
  { label: "Lagos, Nigeria", value: "Lagos,Lagos,Nigeria" },
  { label: "Johannesburg, South Africa", value: "Johannesburg,Gauteng,South Africa" },
  { label: "Cape Town, South Africa", value: "Cape Town,Western Cape,South Africa" },

  // Latin America
  { label: "São Paulo, Brazil", value: "Sao Paulo,Sao Paulo,Brazil" },
  { label: "Rio de Janeiro, Brazil", value: "Rio de Janeiro,Rio de Janeiro,Brazil" },
  { label: "Buenos Aires, Argentina", value: "Buenos Aires,Buenos Aires,Argentina" },
  { label: "Bogotá, Colombia", value: "Bogota,Bogota,Colombia" },
  { label: "Santiago, Chile", value: "Santiago,Santiago Metropolitan,Chile" },
  { label: "Lima, Peru", value: "Lima,Lima,Peru" },
  
  // iraq
{ label: "Baghdad, Iraq", value: "Baghdad,Baghdad,Iraq" },
{ label: "Basra, Iraq", value: "Basra,Basra,Iraq" },
{ label: "Erbil, Iraq", value: "Erbil,Erbil,Iraq" },
{ label: "Mosul, Iraq", value: "Mosul,Nineveh,Iraq" },
{ label: "Najaf, Iraq", value: "Najaf,Najaf,Iraq" },
{ label: "Kirkuk, Iraq", value: "Kirkuk,Kirkuk,Iraq" },

];

export default LOCATIONS;
