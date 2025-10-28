import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    // Build where clause
    const whereClause = {}
    
    if (userId) {
      whereClause.userId = userId
    }
    
    if (status) {
      whereClause.status = status
    }

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
                vendor: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phoneNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    // Get total count
    const totalCount = await prisma.order.count({ where: whereClause })

    return Response.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return Response.json({
      success: false,
      error: 'Failed to fetch orders'
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { userId, items, shippingAddress, paymentMethod, totalAmount } = await request.json()
    
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return Response.json({
        success: false,
        error: 'User ID and items are required'
      }, { status: 400 })
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        shippingAddress: shippingAddress || '',
        paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
        totalAmount: parseFloat(totalAmount) || 0,
        orderItems: {
          create: items.map(item => ({
            productId: item.proId,
            quantity: item.quantity || 1,
            price: parseFloat(item.price) || 0
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
                vendor: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    })

    return Response.json({
      success: true,
      data: order,
      message: 'Order created successfully'
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return Response.json({
      success: false,
      error: 'Failed to create order'
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { orderId, status, shippingAddress, paymentMethod } = await request.json()
    
    if (!orderId) {
      return Response.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 })
    }

    const updateData = {}
    if (status) updateData.status = status
    if (shippingAddress) updateData.shippingAddress = shippingAddress
    if (paymentMethod) updateData.paymentMethod = paymentMethod

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
                vendor: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    })

    return Response.json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully'
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return Response.json({
      success: false,
      error: 'Failed to update order'
    }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    
    if (!orderId) {
      return Response.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 })
    }

    // Delete order items first (due to foreign key constraints)
    await prisma.orderItem.deleteMany({
      where: { orderId: orderId }
    })

    // Delete the order
    await prisma.order.delete({
      where: { id: orderId }
    })

    return Response.json({
      success: true,
      message: 'Order deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return Response.json({
      success: false,
      error: 'Failed to delete order'
    }, { status: 500 })
  }
}
