const { prisma } = require('../config/db');

/**
 * Debug endpoint - Lấy thông tin chi tiết về permissions của user hiện tại
 */
const debugPermissions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Lấy thông tin đầy đủ từ database
    const employee = await prisma.nhanVien.findUnique({
      where: { id: userId },
      include: {
        vaiTro: {
          include: {
            quyen: {
              include: {
                quyen: true
              }
            }
          }
        },
        taiKhoan: true
      }
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên'
      });
    }
    
    // Lấy permissions từ database
    const dbPermissions = employee.vaiTro?.quyen?.map(vq => vq.quyen.ma) || [];
    
    // Permissions từ JWT token
    const tokenPermissions = req.user.permissions || [];
    
    // So sánh
    const missingInToken = dbPermissions.filter(p => !tokenPermissions.includes(p));
    const extraInToken = tokenPermissions.filter(p => !dbPermissions.includes(p));
    
    return res.json({
      success: true,
      data: {
        employee: {
          id: employee.id,
          hoTen: employee.hoTen,
          soDienThoai: employee.soDienThoai
        },
        account: {
          username: employee.taiKhoan?.username
        },
        role: {
          id: employee.vaiTro?.id,
          ten: employee.vaiTro?.ten,
          moTa: employee.vaiTro?.moTa
        },
        permissions: {
          fromDatabase: {
            count: dbPermissions.length,
            list: dbPermissions.sort()
          },
          fromToken: {
            count: tokenPermissions.length,
            list: tokenPermissions.sort()
          },
          comparison: {
            match: dbPermissions.length === tokenPermissions.length && missingInToken.length === 0,
            missingInToken: missingInToken,
            extraInToken: extraInToken
          }
        },
        tokenInfo: {
          id: req.user.id,
          roles: req.user.roles,
          exp: req.user.exp,
          expiresAt: new Date(req.user.exp * 1000).toISOString(),
          isExpired: Date.now() > req.user.exp * 1000
        }
      }
    });
  } catch (error) {
    console.error('[Debug Permissions] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin permissions',
      error: error.message
    });
  }
};

/**
 * Debug endpoint - Lấy tất cả permissions có trong hệ thống
 */
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await prisma.quyen.findMany({
      orderBy: { ma: 'asc' }
    });
    
    const roles = await prisma.vaiTro.findMany({
      include: {
        quyen: {
          include: {
            quyen: true
          }
        },
        _count: {
          select: {
            nhanVien: true
          }
        }
      }
    });
    
    return res.json({
      success: true,
      data: {
        permissions: {
          total: permissions.length,
          list: permissions.map(p => ({
            id: p.id,
            ma: p.ma,
            moTa: p.moTa
          }))
        },
        roles: roles.map(r => ({
          id: r.id,
          ten: r.ten,
          moTa: r.moTa,
          employeeCount: r._count.nhanVien,
          permissions: r.quyen.map(vq => vq.quyen.ma).sort()
        }))
      }
    });
  } catch (error) {
    console.error('[Get All Permissions] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách permissions',
      error: error.message
    });
  }
};

module.exports = {
  debugPermissions,
  getAllPermissions
};
