import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

export const getAnalytics = async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailySales = await getDailySales(startDate, endDate);

    res.json({
      analyticsData,
      dailySales,
    });
  } catch (error) {
    console.log("Error in getAnalytics controller", error.message);
    res.status(500).json({message: "Server error", error: error.message});
  }
};

const getAnalyticsData = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null, //it groups all documents together
        totalSales: {$sum: 1},
        totalRevenue: {$sum: "$totalAmount"},
      }
    }
  ]);

  const {totalSales, totalRevenue} = salesData[0] || {totalSales: 0, totalRevenue: 0};

  return {
    users: totalUsers,
    products: totalProducts,
    sales: totalSales,
    revenue: totalRevenue,
  }
};

const getDailySales = async (startDate, endDate) => {
  try {
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
          sales: {$sum: 1},
          revenue: {$sum: "$totalAmount"},
        }
      },
      {
        $sort: {_id: 1},
      }
    ]);
  
    const dateArray = getDateInRange(startDate, endDate);
  
    return dateArray.map(date => {
      const foundData = dailySales.find(item => item._id === date);
      return {
        date,
        sales: foundData?.sales || 0,
        revenue: foundData?.revenue || 0,
      };
    });
  } catch (error) {
    throw error;
  }
};

function getDateInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while(currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}