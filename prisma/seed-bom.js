const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Helper lists for generating realistic names
const materials = ['Steel', 'Aluminum', 'Plastic', 'Copper', 'Brass', 'Titanium', 'Rubber']
const componentTypes = [
    'Bolt', 'Nut', 'Washer', 'Screw', 'Gear', 'Shaft', 'Bearing', 'Spring',
    'Plate', 'Bracket', 'Housing', 'Gasket', 'Seal', 'Cable', 'Wire',
    'Sensor', 'Switch', 'Connector', 'Resistor', 'Capacitor', 'Chip',
    'Motor', 'Pump', 'Valve', 'Cylinder', 'Piston', 'Nozzle', 'Filter'
]
const specs = ['M4', 'M6', 'M8', '10mm', '20mm', '50mm', '100mm', '12V', '24V', '220V', 'High Speed', 'Heavy Duty']

const productNames = [
    'Industrial Robot Arm X1',
    'Conveyor Belt System 2000',
    'Hydraulic Press Unit',
    'Automated Packaging Station',
    'CNC Control Panel',
    'Drone Assembly Alpha',
    'Smart Sorting Machine'
]

async function main() {
    console.log('🌱 Starting BOM Data Seeding...')

    // 1. Get Company
    let company = await prisma.company.findFirst()
    if (!company) {
        console.log('Creating default company...')
        company = await prisma.company.create({
            data: {
                name: 'Factory Master Inc.',
                status: 'ACTIVE',
                isDefault: true
            }
        })
    }
    console.log(`Using Company: ${company.name} (${company.id})`)

    // 2. Create 50 Components
    console.log('Creating 50 Components...')
    const components = []

    for (let i = 0; i < 50; i++) {
        const material = materials[Math.floor(Math.random() * materials.length)]
        const type = componentTypes[Math.floor(Math.random() * componentTypes.length)]
        const spec = specs[Math.floor(Math.random() * specs.length)]

        const name = `${material} ${type} ${spec}`
        const partNumber = `CMP-${String(i + 1).padStart(4, '0')}`

        // Determine material type for DB enum/string
        let matType = 'OTHER'
        if (['Steel', 'Aluminum', 'Titanium', 'Brass', 'Copper'].some(m => material.includes(m))) matType = 'METAL'
        if (material === 'Plastic' || material === 'Rubber') matType = 'PLASTIC'
        if (['Sensor', 'Switch', 'Motor', 'Resistor', 'Chip'].some(t => type.includes(t))) matType = 'ELECTRONICS'

        const component = await prisma.part.create({
            data: {
                companyId: company.id,
                name: name,
                partNumber: partNumber,
                description: `Standard ${name} for general manufacturing`,
                type: 'COMPONENT',
                materialType: matType,
                stockQuantity: Math.floor(Math.random() * 1000) + 50, // 50-1050 stock
                unit: 'pcs',
                reorderLevel: 20
            }
        })
        components.push(component)
        // print progress every 10 items
        if ((i + 1) % 10 === 0) console.log(`  - Created ${i + 1} components...`)
    }

    // 3. Create 7 Products/Assemblies
    console.log('Creating 7 Products/Assemblies...')
    const products = []

    for (let i = 0; i < productNames.length; i++) {
        const name = productNames[i]
        const partNumber = `PRD-${String(i + 1).padStart(4, '0')}`

        const product = await prisma.part.create({
            data: {
                companyId: company.id,
                name: name,
                partNumber: partNumber,
                description: `Final Assembly: ${name}`,
                type: 'PRODUCT', // Or ASSEMBLY
                materialType: 'ASSEMBLY',
                stockQuantity: Math.floor(Math.random() * 10), // Low stock for finished goods
                unit: 'units',
                reorderLevel: 2
            }
        })
        products.push(product)
        console.log(`  - Created Product: ${name}`)
    }

    // 4. Create BOM Structures (Link Components to Products)
    console.log('Building BOM Trees...')

    for (const product of products) {
        // Randomly select 5 to 15 components for this product
        const numComponents = Math.floor(Math.random() * 11) + 5 // 5-15

        // Shuffle components array to pick random ones
        const shuffled = [...components].sort(() => 0.5 - Math.random())
        const selectedComponents = shuffled.slice(0, numComponents)

        console.log(`  - Adding ${numComponents} items to BOM of ${product.name}`)

        for (const comp of selectedComponents) {
            const qty = Math.floor(Math.random() * 10) + 1 // 1-10 qty

            await prisma.bOMItem.create({
                data: {
                    partId: product.id,
                    componentPartId: comp.id,
                    quantity: qty
                }
            })
        }
    }

    console.log('✅ BOM Data Seeding Completed Successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
