const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');

const signTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, roles: user.roles || [], permissions: user.permissions || [] },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' },
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' },
  );
  return { accessToken, refreshToken };
};

const buildUserPayload = (account) => {
  const role = account?.nhanVien?.vaiTro;
  const roles = role ? [role.ten] : [];
  
  // role.quyen is array of VaiTroQuyen objects
  // Each VaiTroQuyen has a 'quyen' field pointing to Quyen object
  // Quyen object has 'ma' field which is the permission string
  const permissions = role?.quyen?.map((vaiTroQuyen) => vaiTroQuyen.quyen?.ma).filter(Boolean) || [];
  
  console.log('[buildUserPayload] User:', account.username);
  console.log('[buildUserPayload] Role:', role?.ten);
  console.log('[buildUserPayload] Permissions:', permissions);
  
  return {
    id: account.nhanVienId,
    username: account.username,
    hoTen: account.nhanVien?.hoTen,
    roles,
    permissions: Array.from(new Set(permissions)),
  };
};

const register = async ({ username, password, hoTen, soDienThoai }) => {
  // Validate required fields
  if (!username || !password || !hoTen) {
    throw Object.assign(new Error('Vui lòng điền đầy đủ thông tin bắt buộc'), { status: 400 });
  }

  // Check if username already exists
  const existingAccount = await prisma.taiKhoanNguoiDung.findUnique({
    where: { username },
  });
  if (existingAccount) {
    throw Object.assign(new Error('Tên đăng nhập đã tồn tại'), { status: 409 });
  }

  // Check if phone number already exists (if provided)
  if (soDienThoai) {
    const existingPhone = await prisma.nhanVien.findUnique({
      where: { soDienThoai },
    });
    if (existingPhone) {
      throw Object.assign(new Error('Số điện thoại đã được sử dụng'), { status: 409 });
    }
  }

  // Get default role (PhucVu - basic user role)
  let defaultRole = await prisma.vaiTro.findFirst({
    where: { ten: 'PhucVu' },
  });

  // If PhucVu role doesn't exist, create it or use any existing role
  if (!defaultRole) {
    defaultRole = await prisma.vaiTro.findFirst();
    if (!defaultRole) {
      defaultRole = await prisma.vaiTro.create({
        data: { ten: 'PhucVu' },
      });
    }
  }

  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create employee and account in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create NhanVien (employee) record
    const nhanVien = await tx.nhanVien.create({
      data: {
        hoTen,
        soDienThoai: soDienThoai || null,
        vaiTroId: defaultRole.id,
      },
    });

    // Create TaiKhoanNguoiDung (user account) record
    const account = await tx.taiKhoanNguoiDung.create({
      data: {
        username,
        passwordHash,
        nhanVienId: nhanVien.id,
      },
      include: {
        nhanVien: {
          include: {
            vaiTro: {
              include: {
                quyen: {
                  include: { quyen: true },
                },
              },
            },
          },
        },
      },
    });

    return account;
  });

  // Build user payload and generate tokens
  const user = buildUserPayload(result);
  const tokens = signTokens(user);

  return { user, ...tokens };
};

const login = async ({ username, password }) => {
  if (process.env.NO_AUTH === 'true') {
    const user = { id: 'dev-user', username: username || 'dev', roles: ['Admin'], permissions: ['ADMIN_MANAGE'] };
    const tokens = signTokens(user);
    return { user, ...tokens };
  }
  if (!username || !password) throw Object.assign(new Error('Missing credentials'), { status: 400 });
  const account = await prisma.taiKhoanNguoiDung.findUnique({
    where: { username },
    include: {
      nhanVien: {
        include: {
          vaiTro: {
            include: {
              quyen: {
                include: { quyen: true },
              },
            },
          },
        },
      },
    },
  });
  if (!account) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  const ok = await bcrypt.compare(password, account.passwordHash);
  if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  const user = buildUserPayload(account);
  const tokens = signTokens(user);
  return { user, ...tokens };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) throw Object.assign(new Error('Missing refresh token'), { status: 400 });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const account = await prisma.taiKhoanNguoiDung.findFirst({
      where: { nhanVienId: payload.id },
      include: {
        nhanVien: {
          include: {
            vaiTro: {
              include: {
                quyen: { include: { quyen: true } },
              },
            },
          },
        },
      },
    });
    if (!account) throw Object.assign(new Error('Account not found'), { status: 401 });
    const user = buildUserPayload(account);
    const tokens = signTokens(user);
    return { user, ...tokens };
  } catch (err) {
    throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
  }
};

module.exports = { login, register, refresh };
