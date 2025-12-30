const { prisma } = require('./src/config/db');

async function mergeDuplicateOrders() {
    console.log('Starting migration to merge duplicate orders per table...');

    const invoices = await prisma.hoaDon.findMany({
        where: {
            trangThai: { not: 'PAID' }
        },
        include: {
            donHang: {
                include: {
                    ban: true,
                    chiTiet: true
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    console.log(`Found ${invoices.length} active invoices`);

    // Group by Table ID using Map
    const byTable = new Map();
    for (const inv of invoices) {
        if (!inv.donHang || !inv.donHang.banId) continue;

        const tableId = inv.donHang.banId;
        if (!byTable.has(tableId)) {
            byTable.set(tableId, []);
        }
        const list = byTable.get(tableId);
        list.push(inv);
    }

    let mergedCount = 0;

    for (const [tableId, tableInvoices] of byTable.entries()) {
        if (tableInvoices.length <= 1) continue;

        const tableName = tableInvoices[0].donHang.ban?.ten || 'Unknown';
        console.log(`Merging ${tableInvoices.length} invoices for table ${tableName} (${tableId})`);

        // Target is the first (oldest) invoice/order
        const targetInv = tableInvoices[0];
        const targetOrderId = targetInv.donHangId;
        const sources = tableInvoices.slice(1);

        await prisma.$transaction(async (tx) => {
            let itemsMoved = 0;

            for (const src of sources) {
                // 1. Move items to target order
                const moveResult = await tx.chiTietDonHang.updateMany({
                    where: { donHangId: src.donHangId },
                    data: { donHangId: targetOrderId }
                });
                itemsMoved += moveResult.count;

                // 2. Append notes if any
                if (src.donHang.ghiChu) {
                    const currentOrder = await tx.donHang.findUnique({ where: { id: targetOrderId } });
                    const newNote = currentOrder?.ghiChu
                        ? `${currentOrder.ghiChu}; ${src.donHang.ghiChu}`
                        : src.donHang.ghiChu;
                    await tx.donHang.update({ where: { id: targetOrderId }, data: { ghiChu: newNote } });
                }

                // 3. Delete source invoice
                await tx.hoaDon.delete({ where: { id: src.id } });

                // 4. Delete source order
                await tx.donHang.delete({ where: { id: src.donHangId } });
            }

            console.log(`  Moved ${itemsMoved} items to order ${targetOrderId}`);

            // 5. Recalculate target invoice totals
            const allItems = await tx.chiTietDonHang.findMany({
                where: { donHangId: targetOrderId, trangThai: { not: 'DAHUY' } }
            });

            let subtotal = 0;
            for (const item of allItems) {
                subtotal += Number(item.donGia) * item.soLuong;
            }

            const vatConfig = await tx.cauHinhHeThong.findUnique({ where: { key: 'VAT' } });
            const vatRate = vatConfig ? Number(vatConfig.value) : 10;
            const thueVAT = (subtotal * vatRate) / 100;
            const tongThanhToan = subtotal + thueVAT;

            await tx.hoaDon.update({
                where: { id: targetInv.id },
                data: {
                    tongTienHang: subtotal,
                    thueVAT: thueVAT,
                    tongThanhToan: tongThanhToan
                }
            });

            console.log(`  Updated invoice ${targetInv.id}`);
        });

        mergedCount++;
    }

    console.log(`Successfully merged duplicate invoices for ${mergedCount} tables.`);
}

mergeDuplicateOrders()
    .then(() => process.exit(0))
    .catch(e => { console.error('Migration failed:', e); process.exit(1); });
