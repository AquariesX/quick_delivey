import { prisma } from '@/lib/prisma'

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url)
		const page = parseInt(searchParams.get('page')) || 1
		const limit = parseInt(searchParams.get('limit')) || 12
		const search = searchParams.get('search') || ''
		const catId = searchParams.get('catId') || ''
		const subCatId = searchParams.get('subCatId') || ''
		const vendorId = searchParams.get('vendorId') || ''
		const minPrice = searchParams.get('minPrice')
		const maxPrice = searchParams.get('maxPrice')
		const sortBy = searchParams.get('sortBy') || 'newest'

		// Build where clause – customer should only see active + approved
		const whereClause = {
			status: true,
			approvalStatus: 'Approved'
		}

		if (search) {
			whereClause.OR = [
				{ proName: { contains: search, mode: 'insensitive' } },
				{ description: { contains: search, mode: 'insensitive' } },
				{ sku: { contains: search, mode: 'insensitive' } }
			]
		}

		if (catId) whereClause.catId = catId
		if (subCatId) whereClause.subCatId = parseInt(subCatId)
		if (vendorId) whereClause.vendorId = vendorId

		if (minPrice || maxPrice) {
			whereClause.price = {}
			if (minPrice) whereClause.price.gte = parseFloat(minPrice)
			if (maxPrice) whereClause.price.lte = parseFloat(maxPrice)
		}

		// Sorting options for customer listing
		let orderBy = { createdAt: 'desc' }
		switch (sortBy) {
			case 'name':
				orderBy = { proName: 'asc' }
				break
			case 'price_low':
				orderBy = { price: 'asc' }
				break
			case 'price_high':
				orderBy = { price: 'desc' }
				break
			case 'oldest':
				orderBy = { createdAt: 'asc' }
				break
			default:
				orderBy = { createdAt: 'desc' }
		}

		const products = await prisma.product.findMany({
			where: whereClause,
			include: {
				category: true,
				subCategory: true,
				vendor: {
					select: { id: true, username: true, email: true, role: true }
				}
			},
			orderBy,
			skip: (page - 1) * limit,
			take: limit
		})

		const total = await prisma.product.count({ where: whereClause })

		// Parse JSON-like fields if stored as strings
		const normalized = products.map((p) => ({
			...p,
			proImages: safeParseJson(p.proImages),
			keyFeatures: safeParseJson(p.keyFeatures),
			variations: safeParseJson(p.variations),
			reviews: safeParseJson(p.reviews)
		}))

		return Response.json({
			success: true,
			data: normalized,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit)
			}
		})
	} catch (error) {
		console.error('Customer products fetch failed:', error)
		return Response.json({ success: false, error: 'Failed to fetch products' }, { status: 500 })
	}
}

function safeParseJson(value) {
	if (value === null || value === undefined) return null
	if (typeof value !== 'string') return value
	try {
		return JSON.parse(value)
	} catch (_e) {
		return value
	}
}


