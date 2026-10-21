import { formatDOP } from '../utils/format';

interface Props {
  payment: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal = ({ payment, isOpen, onClose }: Props) => {
  if (!isOpen || !payment) return null;

  const handleSendWhatsAppReceipt = (p: any) => {
    if (!p) return;
    const client = p.loan?.client;
    const clientName = p.clientName || client?.name || 'Cliente';
    const rawPhone = client?.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const targetPhone = cleanPhone.length === 10 ? `1${cleanPhone}` : cleanPhone;
    const amount = formatDOP(p.amount);
    const receiptNo = `REC-${new Date().getFullYear()}-${p.id.toString().padStart(4, '0')}`;
    const dateStr = new Date(p.date || p.createdAt || Date.now()).toLocaleDateString('es-DO', { hour: '2-digit', minute: '2-digit' });
    const notes = p.notes || (p.isInterestOnly ? 'Pago de Rédito' : 'Cuota Regular');
    const capitalLeft = formatDOP(
      p.isInterestOnly
        ? p.loan?.installments?.filter((i: any) => i.status === 'PENDING').reduce((acc: number, i: any) => acc + Number(i.capital), 0) || p.loan?.amount || 0
        : p.loan?.installments?.filter((i: any) => i.status === 'PENDING').reduce((acc: number, i: any) => acc + Number(i.amount), 0) || 0
    );

    const msg = `🧾 *COMPROBANTE OFICIAL DE PAGO*\n` +
      `*PresPro Systems - Plataforma Financiera*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Cliente:* ${clientName}\n` +
      `📄 *No. Recibo:* ${receiptNo}\n` +
      `💵 *Monto Pagado:* RD$ ${amount}\n` +
      `📌 *Concepto:* ${notes}\n` +
      `📉 *Balance Restante:* RD$ ${capitalLeft}\n` +
      `📅 *Fecha:* ${dateStr}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ _Pago registrado exitosamente. Conserve este comprobante como garantía oficial._`;

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md no-print" onClick={onClose}></div>
      <div className="bg-white rounded-[2rem] w-full max-w-md relative z-10 shadow-3xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[95vh]">
        
        {/* Receipt Header - No Print */}
        <div className={`${payment.isInterestOnly ? 'bg-amber-500' : 'bg-emerald-500'} px-8 py-5 flex items-center justify-between flex-shrink-0 no-print`}>
          <div className="flex items-center gap-3 text-white">
            <span className="material-symbols-outlined font-black">verified</span>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none">
              {payment.isInterestOnly ? 'Recibo de Rédito Generado' : 'Recibo de Transacción Generado'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 md:p-10 text-left bg-white" id="printable-receipt">
            <div className="text-center mb-6 space-y-1">
              <h4 className="text-xl font-black text-black font-headline tracking-tighter uppercase">
                {payment.isInterestOnly ? 'RECIBO DE PAGO DE RÉDITO Y CAPITAL' : 'RECIBO DE PAGO'}
              </h4>
              <p className="text-[10px] font-bold text-black uppercase tracking-widest border-b border-black pb-2">PRESPRO SYSTEMS - SISTEMAFAC</p>
            </div>

            <div className="space-y-4 text-[13px] font-medium text-black">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase">NRO. DE OPERACION: {String(payment.id).padStart(5, '0')}</p>
                <p className="text-[10px] font-black uppercase">RECIBO NO: PAY-{String(payment.id).padStart(4, '0')}</p>
              </div>

              <div className="border-t border-black pt-2 flex flex-col gap-1">
                <p className="font-bold uppercase"><span className="font-black">CLIENTE:</span> {payment.clientName || payment.loan?.client?.name}</p>
                <p className="font-bold uppercase"><span className="font-black">CEDULA:</span> {payment.loan?.client?.identification || 'N/A'}</p>
              </div>

              <div className="border-t border-black pt-2 flex flex-col gap-1">
                <p className="font-bold uppercase"><span className="font-black">REMITENTE:</span> ADMINISTRACION PRO</p>
                <p className="font-bold uppercase"><span className="font-black">SERVICIO:</span> {payment.isInterestOnly ? 'PAGO DE RÉDITO Y CAPITAL' : 'COBRO DE CUOTA REGULAR'}</p>
                <p className="font-bold uppercase"><span className="font-black">METODO:</span> {payment.method === 'CASH' ? 'EFECTIVO' : 'TRANSFERENCIA'}</p>
                {payment.notes && (
                  <p className="font-bold uppercase text-[11px]"><span className="font-black">CONCEPTO:</span> {payment.notes}</p>
                )}
              </div>

              <div className="border-t border-black pt-2 space-y-2">
                <div className="flex justify-between items-center bg-black/5 p-2 border border-black">
                  <span className="font-black uppercase tracking-tighter">
                    {payment.isInterestOnly ? 'TOTAL COBRADO:' : 'VALOR A COBRAR:'}
                  </span>
                  <span className="text-lg font-black italic">RD$ {formatDOP(payment.amount)}</span>
                </div>
                
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="uppercase font-black">
                    {payment.isInterestOnly ? 'CAPITAL PENDIENTE ACTUAL:' : 'SALDO RESTANTE:'}
                  </span>
                  <span className="font-black">RD$ {formatDOP(
                    payment.isInterestOnly
                      ? payment.loan?.installments?.filter((i: any) => i.status === 'PENDING').reduce((acc: number, i: any) => acc + Number(i.capital), 0) || payment.loan?.amount || 0
                      : payment.loan?.installments?.filter((i: any) => i.status === 'PENDING').reduce((acc: number, i: any) => acc + Number(i.amount), 0) || 0
                  )}</span>
                </div>
              </div>

              <div className="border-t border-black pt-4 text-[10px] space-y-1">
                <p className="font-black uppercase">FECHA COBRO: {new Date(payment.date).toLocaleDateString('es-DO')} {new Date(payment.date).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="font-black uppercase">ATENDIDO POR: {payment.user?.name || 'Administrador'}</p>
              </div>

              <div className="text-center pt-6 border-t border-dashed border-black">
                <p className="text-[9px] font-bold italic leading-tight">
                  {payment.isInterestOnly
                    ? 'El cliente realizó el pago de rédito (intereses). Este pago prorroga la fecha de vencimiento sin disminuir el capital del préstamo. Conserve este comprobante.'
                    : 'El cliente reconoce haber realizado el pago correspondiente a la cuota del préstamo mencionado. Conserve este comprobante para cualquier reclamación.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer - No Print */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-3 flex-shrink-0 no-print">
          <button 
            onClick={() => handleSendWhatsAppReceipt(payment)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-emerald-600/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">chat</span>
            <span className="tracking-widest uppercase text-[12px]">Enviar Recibo por WhatsApp</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-black shadow-xl shadow-slate-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">print</span>
            <span className="tracking-widest uppercase text-[12px]">Imprimir Recibo Pro</span>
          </button>
          <button 
            onClick={onClose}
            className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors cursor-pointer"
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
