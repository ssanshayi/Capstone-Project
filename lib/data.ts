export interface MarineSpecies {
  id: string
  name: string
  scientificName: string
  iconUrl: string
  imageUrl: string
  description: string
  conservationStatus: string
  lifespan: string
  size: string
  diet: string
  habitat: string
  geographicRange: string
  threats: string[]
  conservationEfforts: string
  populationTrend: "Increasing" | "Stable" | "Decreasing" | "Unknown"
  populationPercentage: number
  migrationPattern: string
  depthRange: string
  averageSpeed: string
  taggedCount: number
  firstTagged: string
  startPosition: [number, number]
  endPosition: [number, number]
  speed: number
  tags: string[]
}

// Sample data as fallback if API fails
export const marineSpeciesData: MarineSpecies[] = [
  {
    id: "1",
    name: "Blue Whale",
    scientificName: "Balaenoptera musculus",
    iconUrl: "/placeholder.svg?height=40&width=40",
    imageUrl: "/placeholder.svg?height=400&width=600",
    description:
      "The blue whale is the largest animal known to have ever existed. These magnificent marine mammals rule the oceans at up to 100 feet long and upwards of 200 tons.",
    conservationStatus: "Endangered",
    lifespan: "80-90 years",
    size: "Up to 100 feet (30m)",
    diet: "Krill",
    habitat: "Open ocean, deep waters",
    geographicRange: "Found in all oceans except the Arctic",
    threats: ["Ship strikes", "Entanglement in fishing gear", "Ocean noise", "Climate change"],
    conservationEfforts:
      "Protected by the International Whaling Commission since 1966. Various conservation programs track migrations and establish protected marine areas.",
    populationTrend: "Increasing",
    populationPercentage: 40,
    migrationPattern:
      "Seasonal migration between feeding grounds in polar waters and breeding grounds in tropical waters",
    depthRange: "100-500m",
    averageSpeed: "5-20 mph",
    taggedCount: 24,
    firstTagged: "2005",
    startPosition: [30, -130],
    endPosition: [45, -125],
    speed: 0.5,
    tags: ["Mammal", "Endangered", "Filter Feeder"],
  },
  {
    id: "2",
    name: "Great White Shark",
    scientificName: "Carcharodon carcharias",
    iconUrl: "/placeholder.svg?height=40&width=40",
    imageUrl: "/placeholder.svg?height=400&width=600",
    description:
      "The great white shark is a species of large mackerel shark notable for its size, with larger female individuals growing to 6.1 m in length and 1,905 kg in weight.",
    conservationStatus: "Vulnerable",
    lifespan: "70+ years",
    size: "15-20 feet (4.6-6.1m)",
    diet: "Seals, sea lions, fish, other sharks",
    habitat: "Coastal and offshore waters",
    geographicRange: "Found in coastal surface waters of all major oceans",
    threats: ["Overfishing", "Bycatch", "Shark finning", "Habitat degradation"],
    conservationEfforts:
      "Protected in many countries including Australia, South Africa, and the United States. CITES Appendix II listing restricts international trade.",
    populationTrend: "Decreasing",
    populationPercentage: 30,
    migrationPattern: "Long-distance migrations, often returning to the same coastal areas seasonally",
    depthRange: "0-1200m",
    averageSpeed: "25 mph",
    taggedCount: 56,
    firstTagged: "2000",
    startPosition: [-30, 20],
    endPosition: [-35, 15],
    speed: 0.8,
    tags: ["Shark", "Predator", "Vulnerable"],
  },
  {
    id: "3",
    name: "Sea Turtle",
    scientificName: "Chelonia mydas",
    iconUrl: "/placeholder.svg?height=40&width=40",
    imageUrl: "/placeholder.svg?height=400&width=600",
    description:
      "Green sea turtles are one of the world's largest species of turtle. They can weigh up to 700 pounds and grow to about 5 feet in length.",
    conservationStatus: "Endangered",
    lifespan: "60-70 years",
    size: "3-4 feet (0.9-1.2m)",
    diet: "Seagrass, algae",
    habitat: "Tropical and subtropical coastal waters",
    geographicRange: "Found in tropical and subtropical waters around the world",
    threats: ["Habitat loss", "Pollution", "Poaching", "Climate change", "Bycatch"],
    conservationEfforts:
      "Protected under CITES and various national laws. Conservation efforts include nesting beach protection, reducing bycatch, and habitat restoration.",
    populationTrend: "Stable",
    populationPercentage: 50,
    migrationPattern: "Migrate long distances between feeding grounds and nesting beaches",
    depthRange: "0-40m",
    averageSpeed: "1.5-5.8 mph",
    taggedCount: 87,
    firstTagged: "1995",
    startPosition: [0, -40],
    endPosition: [10, -30],
    speed: 0.3,
    tags: ["Reptile", "Endangered", "Herbivore"],
  },
  {
    id: "4",
    name: "Orca",
    scientificName: "Orcinus orca",
    iconUrl: "/placeholder.svg?height=40&width=40",
    imageUrl: "/placeholder.svg?height=400&width=600",
    description:
      "The orca or killer whale is a toothed whale belonging to the oceanic dolphin family, of which it is the largest member. It is recognizable by its black-and-white patterned body.",
    conservationStatus: "Near Threatened",
    lifespan: "50-80 years",
    size: "23-32 feet (7-9.7m)",
    diet: "Fish, seals, sharks, other whales",
    habitat: "All oceans, from polar to tropical waters",
    geographicRange: "Global distribution, found in all oceans",
    threats: ["Pollution", "Prey depletion", "Habitat disturbance", "Vessel traffic"],
    conservationEfforts:
      "Protected under the Marine Mammal Protection Act and various international agreements. Research and monitoring programs track populations.",
    populationTrend: "Stable",
    populationPercentage: 70,
    migrationPattern: "Some populations are resident, others migrate seasonally following prey",
    depthRange: "0-500m",
    averageSpeed: "30 mph",
    taggedCount: 32,
    firstTagged: "2003",
    startPosition: [60, -150],
    endPosition: [65, -140],
    speed: 0.7,
    tags: ["Mammal", "Predator", "Social"],
  },
  {
    id: "5",
    name: "Manta Ray",
    scientificName: "Manta birostris",
    iconUrl: "/placeholder.svg?height=40&width=40",
    imageUrl: "/placeholder.svg?height=400&width=600",
    description:
      "Manta rays are large rays belonging to the genus Manta. The largest rays in the world, they have triangular pectoral fins, horn-shaped cephalic fins and large, forward-facing mouths.",
    conservationStatus: "Vulnerable",
    lifespan: "40+ years",
    size: "18-23 feet (5.5-7m) wingspan",
    diet: "Plankton, small fish",
    habitat: "Tropical and subtropical waters",
    geographicRange: "Tropical, subtropical and temperate waters worldwide",
    threats: ["Fishing pressure", "Bycatch", "Habitat degradation", "Marine pollution"],
    conservationEfforts:
      "Listed on CITES Appendix II. Protected in many countries and international waters. Research programs track migrations and population trends.",
    populationTrend: "Decreasing",
    populationPercentage: 45,
    migrationPattern: "Seasonal migrations following plankton blooms",
    depthRange: "0-1000m",
    averageSpeed: "10 mph",
    taggedCount: 41,
    firstTagged: "2008",
    startPosition: [-5, 100],
    endPosition: [5, 110],
    speed: 0.4,
    tags: ["Ray", "Filter Feeder", "Vulnerable"],
  },
  {
    id: "6",
    name: "Humpback Whale",
    scientificName: "Megaptera novaeangliae",
    iconUrl: "/placeholder.svg?height=40&width=40",
    imageUrl: "/placeholder.svg?height=400&width=600",
    description:
      "The humpback whale is a species of baleen whale known for its distinctive body shape and complex vocalizations. They are known for their acrobatic displays, such as breaching and tail-slapping.",
    conservationStatus: "Least Concern",
    lifespan: "45-100 years",
    size: "48-62 feet (14.6-19m)",
    diet: "Krill, small fish",
    habitat: "Open ocean, coastal areas",
    geographicRange: "Found in oceans and seas around the world",
    threats: ["Ship strikes", "Entanglement in fishing gear", "Noise pollution", "Climate change"],
    conservationEfforts:
      "Protected by the International Whaling Commission. Many populations have recovered following the end of commercial whaling.",
    populationTrend: "Increasing",
    populationPercentage: 65,
    migrationPattern:
      "One of the longest migrations of any mammal, between polar feeding areas and tropical breeding grounds",
    depthRange: "0-200m",
    averageSpeed: "3-9 mph",
    taggedCount: 68,
    firstTagged: "1998",
    startPosition: [-20, -60],
    endPosition: [-10, -70],
    speed: 0.6,
    tags: ["Mammal", "Baleen Whale", "Migratory"],
  },
]
