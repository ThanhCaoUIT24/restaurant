import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  listOpenInvoices,
  listPendingOrders,
  checkoutOrder, 
  payInvoice, 
  fetchCurrentShift, 
  openShift, 
  closeShift,
  getInvoiceDetails,
  getInvoicePrintData,
  splitBillByItems,
  splitBillByPeople,
  mergeInvoices,
  getZReport,
  exportZReport,
  exportInvoices,
  getDailySalesReport,
} from '../api/billing.api';

export const useOpenInvoices = () =>
  useQuery({
    queryKey: ['openInvoices'],
    queryFn: listOpenInvoices,
    refetchInterval: 8000,
  });

export const usePendingOrders = () =>
  useQuery({
    queryKey: ['pendingOrders'],
    queryFn: listPendingOrders,
    refetchInterval: 8000,
  });

export const useInvoiceDetails = (invoiceId) =>
  useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => getInvoiceDetails(invoiceId),
    enabled: !!invoiceId,
  });

export const useInvoicePrintData = (invoiceId) =>
  useQuery({
    queryKey: ['invoicePrint', invoiceId],
    queryFn: () => getInvoicePrintData(invoiceId),
    enabled: !!invoiceId,
  });

export const useDailySalesReport = (date) =>
  useQuery({
    queryKey: ['dailySalesReport', date],
    queryFn: () => getDailySalesReport(date),
    enabled: !!date,
  });

export const useCheckoutOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }) => checkoutOrder(orderId, payload),
    onSuccess: () => {
      qc.invalidateQueries(['openInvoices']);
      qc.invalidateQueries(['pendingOrders']);
    },
  });
};

export const usePayInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, payload }) => payInvoice(invoiceId, payload),
    onSuccess: () => {
      qc.invalidateQueries(['openInvoices']);
      qc.invalidateQueries(['currentShift']);
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useSplitBillByItems = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, itemIds }) => splitBillByItems(invoiceId, itemIds),
    onSuccess: () => qc.invalidateQueries(['openInvoices']),
  });
};

export const useSplitBillByPeople = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, numPeople }) => splitBillByPeople(invoiceId, numPeople),
    onSuccess: () => qc.invalidateQueries(['openInvoices']),
  });
};

export const useMergeInvoices = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceIds }) => mergeInvoices(invoiceIds),
    onSuccess: () => qc.invalidateQueries(['openInvoices']),
  });
};

export const useGetZReport = (shiftId) =>
  useQuery({
    queryKey: ['zreport', shiftId],
    queryFn: () => getZReport(shiftId),
    enabled: !!shiftId,
  });

export const useExportZReport = () => {
  return useMutation({
    mutationFn: ({ shiftId, format }) => exportZReport(shiftId, format),
  });
};

export const useExportInvoices = () => {
  return useMutation({
    mutationFn: (filters) => exportInvoices(filters),
  });
};

export const useCurrentShift = () =>
  useQuery({
    queryKey: ['currentShift'],
    queryFn: fetchCurrentShift,
    refetchInterval: 10000,
  });

export const useOpenShift = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: openShift,
    onSuccess: () => qc.invalidateQueries(['currentShift']),
  });
};

export const useCloseShift = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ shiftId, payload }) => closeShift(shiftId, payload),
    onSuccess: () => qc.invalidateQueries(['currentShift']),
  });
};
