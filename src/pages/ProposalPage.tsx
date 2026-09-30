import { useMemo, useState, useRef } from 'react';
import {
  Phone,
  Instagram,
  Shield,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Star,
  Sparkles,
  Home,
  Car,
  Upload,
  FileText,
  X,
  Send,
  Mail,
  MapPin,
  CreditCard,
  Percent,
  PieChart,
  Loader2,
  Clock,
  Zap,
} from 'lucide-react';
import { formatCurrency, formatDate, addDays } from '../utils/format';
import { calculateGenericFinancing, MARKET_RATES } from '../utils/financing';

type ConsortiumType = 'imobiliario' | 'automovel';
type LanceType = 'fixo' | 'livre' | 'nenhum';

interface ProposalData {
  creditValue: number;
  firstInstallment: number;
  otherInstallments: number;
  postContemplationInstallment: number | null;
  months: number;
  sellerName: string;
  clientName: string;
  isParcelinha: boolean;
  consortiumType: ConsortiumType;
  taxaAdministrativa: number;
  fundoReserva: number;
  lanceType: LanceType;
  lanceLivreValue: number | null;
}

interface AcquireFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  cpf: string;
  cnhFile: File | null;
  comprovanteFile: File | null;
}

function getProposalData(): ProposalData | null {
  const hash = window.location.hash;
  const queryString = hash.split('?')[1] || '';
  const params = new URLSearchParams(queryString);

  const creditValue = parseFloat(params.get('credito') || '0');
  const firstInstallment = parseFloat(params.get('parcela1') || '0');
  const otherInstallments = parseFloat(params.get('parcelas') || '0');
  const months = parseInt(params.get('meses') || '0');
  const sellerName = params.get('vendedor') || '';
  const clientName = params.get('cliente') || '';
  const isParcelinha = params.get('parcelinha') === '1';
  const consortiumType = (params.get('tipo') as ConsortiumType) || 'imobiliario';
  const taxaAdministrativa = parseFloat(params.get('taxa_adm') || '0');
  const fundoReserva = parseFloat(params.get('fundo_reserva') || '0');
  const lanceType = (params.get('lance_type') as LanceType) || 'nenhum';
  const lanceLivreValue = lanceType === 'livre' 
    ? parseFloat(params.get('lance_livre') || '0') || null 
    : null;
  const postContemplationInstallment = isParcelinha
    ? parseFloat(params.get('parcela_pos') || '0') || null
    : null;

  if (!creditValue || !firstInstallment || !otherInstallments || !months) {
    return null;
  }

  return {
    creditValue,
    firstInstallment,
    otherInstallments,
    postContemplationInstallment,
    months,
    sellerName,
    clientName,
    isParcelinha,
    consortiumType,
    taxaAdministrativa,
    fundoReserva,
    lanceType,
    lanceLivreValue,
  };
}

export default function ProposalPage() {
  const data = useMemo(() => getProposalData(), []);
  const [showAcquireForm, setShowAcquireForm] = useState(false);
  const [acquireForm, setAcquireForm] = useState<AcquireFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    cpf: '',
    cnhFile: null,
    comprovanteFile: null,
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const cnhInputRef = useRef<HTMLInputElement>(null);
  const comprovanteInputRef = useRef<HTMLInputElement>(null);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 rounded-2xl border border-red-500/30 p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Proposta Inválida</h2>
          <p className="text-slate-400">
            Os dados da proposta não foram encontrados. Solicite um novo link ao seu consultor.
          </p>
          <a
            href="https://wa.me/5579981386285"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all"
          >
            <Phone className="w-4 h-4" />
            Falar com Consultor
          </a>
        </div>
      </div>
    );
  }

  const isImobiliario = data.consortiumType === 'imobiliario';

  const totalConsortium = useMemo(() => {
    let total = data.firstInstallment + data.otherInstallments * (data.months - 1);
    if (data.isParcelinha && data.postContemplationInstallment) {
      const monthsBefore = Math.min(6, data.months);
      const monthsAfter = data.months - monthsBefore;
      total =
        data.firstInstallment +
        data.otherInstallments * (monthsBefore - 1) +
        data.postContemplationInstallment * monthsAfter;
    }
    return total;
  }, [data]);

  // Valor líquido para financiamento (quando há lance embutido)
  const valorLiquidoParaFinanciamento = data.lanceType === 'fixo' 
    ? data.creditValue - (data.creditValue * 0.25)
    : data.creditValue;

  const financing = useMemo(
    () => {
      const rate = isImobiliario ? MARKET_RATES.imobiliario : MARKET_RATES.automovel;
      return calculateGenericFinancing(
        valorLiquidoParaFinanciamento, 
        data.months, 
        rate.monthly
      );
    },
    [data, isImobiliario, valorLiquidoParaFinanciamento]
  );
  
  const economia = financing.totalPaid - totalConsortium;
  const economiaPercent = (economia / financing.totalPaid) * 100;
  
  const indiceReajuste = isImobiliario ? 'INCC' : 'IPCA';
  const indiceDescription = isImobiliario
    ? 'Índice Nacional de Custo da Construção'
    : 'Índice Nacional de Preços ao Consumidor Amplo';

  // Validade de 24h
  const validityDateTime = addDays(new Date(), 1);
  const validityDate = validityDateTime.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  // Cálculo do lance
  const lanceValue = data.lanceType === 'fixo' 
    ? data.creditValue * 0.25 
    : data.lanceType === 'livre' && data.lanceLivreValue 
    ? data.lanceLivreValue 
    : 0;
  
  // Índices do ano anterior (2025)
  const indiceAnoAnterior = isImobiliario ? 6.10 : 4.26;
  const indiceNome = isImobiliario ? 'INCC' : 'IPCA';

  const taxaValor = data.creditValue * (data.taxaAdministrativa / 100);
  const fundoValor = data.creditValue * (data.fundoReserva / 100);
  const totalEncargos = taxaValor + fundoValor;
  
  // Cálculo do valor líquido a receber (quando há lance embutido)
  // O lance é deduzido do valor da carta, então o cliente recebe menos
  const valorLiquidoReceber = data.lanceType === 'fixo' 
    ? data.creditValue - lanceValue 
    : data.creditValue;
  
  // Valor total que o cliente paga = Valor Líquido + Taxas (sobre crédito contratado)
  // Se há lance embutido: Total = (Crédito - Lance) + Taxas
  // Se não há lance: Total = Crédito + Taxas
  const totalGeral = valorLiquidoReceber + totalEncargos;

  const handleFileChange = (field: 'cnhFile' | 'comprovanteFile', file: File | null) => {
    setAcquireForm((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmitAcquire = async () => {
    setSending(true);
    setSendError('');

    // Monta o FormData para envio via FormSubmit
    const formData = new FormData();
    
    // Dados do cliente
    formData.append('name', acquireForm.name || data.clientName);
    formData.append('_subject', `🔥 NOVA AQUISIÇÃO - ${acquireForm.name || data.clientName}`);
    formData.append('_template', 'box');
    formData.append('_captcha', 'false');
    
    // Monta o corpo do email em HTML
    const htmlContent = `
      <h2 style="color: #10b981; font-family: Arial, sans-serif;">📋 Nova Aquisição de Consórcio</h2>
      
      <h3 style="color: #334155; font-family: Arial, sans-serif;">👤 Dados do Cliente</h3>
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Nome:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${acquireForm.name || data.clientName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">CPF:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${acquireForm.cpf}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Email:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${acquireForm.email}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Telefone:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${acquireForm.phone}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Endereço:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${acquireForm.address || 'Não informado'}</td></tr>
      </table>
      
      <h3 style="color: #334155; font-family: Arial, sans-serif; margin-top: 20px;">💼 Dados do Consórcio</h3>
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Valor Contratado:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${formatCurrency(data.creditValue)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Tipo:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${isImobiliario ? '🏠 Imobiliário' : '🚗 Automóvel'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Prazo:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${data.months} meses</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Modalidade:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${data.isParcelinha ? 'Parcelinha' : 'Tradicional'}</td></tr>
        ${data.lanceType === 'fixo' ? `
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Lance Embutido:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">25% = ${formatCurrency(lanceValue)}</td></tr>
        <tr style="background-color: #dbeafe;"><td style="padding: 8px; border: 1px solid #3b82f6; font-weight: bold;">Valor Líquido a Receber:</td><td style="padding: 8px; border: 1px solid #3b82f6; font-weight: bold; color: #2563eb;">${formatCurrency(valorLiquidoReceber)}</td></tr>
        ` : data.lanceType === 'livre' ? `<tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Lance Livre:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${formatCurrency(lanceValue)}</td></tr>` : ''}
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Taxa Administrativa:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${data.taxaAdministrativa}% sobre ${formatCurrency(data.creditValue)} = ${formatCurrency(taxaValor)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Fundo Reserva:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${data.fundoReserva}% sobre ${formatCurrency(data.creditValue)} = ${formatCurrency(fundoValor)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">1ª Parcela:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${formatCurrency(data.firstInstallment)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Demais Parcelas:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${formatCurrency(data.otherInstallments)}</td></tr>
        ${data.isParcelinha && data.postContemplationInstallment ? `<tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Pós-Contemplação:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${formatCurrency(data.postContemplationInstallment)}</td></tr>` : ''}
        <tr style="background-color: #fef3c7;"><td style="padding: 8px; border: 1px solid #f59e0b; font-weight: bold;">Total a Pagar (${data.lanceType === 'fixo' ? 'Líquido' : 'Crédito'} + Encargos):</td><td style="padding: 8px; border: 1px solid #f59e0b; font-weight: bold; color: #d97706;">${formatCurrency(totalGeral)}</td></tr>
      </table>
      
      <h3 style="color: #334155; font-family: Arial, sans-serif; margin-top: 20px;">📊 Comparativo com Financiamento</h3>
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
        <tr style="background-color: #ecfdf5;"><td style="padding: 8px; border: 1px solid #10b981; font-weight: bold;">Consórcio - Total:</td><td style="padding: 8px; border: 1px solid #10b981; font-weight: bold; color: #10b981;">${formatCurrency(totalGeral)}</td></tr>
        <tr style="background-color: #fef2f2;"><td style="padding: 8px; border: 1px solid #ef4444; font-weight: bold;">Financiamento - Valor:</td><td style="padding: 8px; border: 1px solid #ef4444;">${formatCurrency(valorLiquidoParaFinanciamento)}</td></tr>
        <tr style="background-color: #fef2f2;"><td style="padding: 8px; border: 1px solid #ef4444; font-weight: bold;">Financiamento - Juros (${isImobiliario ? '11,40% a.a.' : '26% a.a.'}):</td><td style="padding: 8px; border: 1px solid #ef4444;">${formatCurrency(financing.totalInterest)}</td></tr>
        <tr style="background-color: #fef2f2;"><td style="padding: 8px; border: 1px solid #ef4444; font-weight: bold;">Financiamento - Total:</td><td style="padding: 8px; border: 1px solid #ef4444; font-weight: bold; color: #dc2626;">${formatCurrency(financing.totalPaid)}</td></tr>
        <tr style="background-color: #f0fdf4;"><td style="padding: 8px; border: 1px solid #22c55e; font-weight: bold;">Economia com Consórcio:</td><td style="padding: 8px; border: 1px solid #22c55e; font-weight: bold; color: #16a34a;">${formatCurrency(economia)} (${economiaPercent.toFixed(1)}%)</td></tr>
      </table>
      
      <h3 style="color: #334155; font-family: Arial, sans-serif; margin-top: 20px;">📎 Documentos Anexados</h3>
      <p style="font-family: Arial, sans-serif;">
        ${acquireForm.cnhFile ? `✅ CNH/Habilitação: <strong>${acquireForm.cnhFile.name}</strong>` : '❌ CNH não informada'}<br>
        ${acquireForm.comprovanteFile ? `✅ Comprovante de Residência: <strong>${acquireForm.comprovanteFile.name}</strong>` : '❌ Comprovante não informado'}
      </p>
      
      <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 20px 0;">
      <p style="color: #64748b; font-size: 12px; font-family: Arial, sans-serif;">
        Proposta elaborada por: ${data.sellerName}<br>
        Cliente: ${data.clientName}<br>
        Data: ${new Date().toLocaleString('pt-BR')}
      </p>
    `;
    
    formData.append('html_content', htmlContent);
    formData.append('message', htmlContent);
    
    // Adiciona os arquivos
    if (acquireForm.cnhFile) {
      formData.append('attachment', acquireForm.cnhFile, `CNH_${acquireForm.cnhFile.name}`);
    }
    if (acquireForm.comprovanteFile) {
      formData.append('attachment', acquireForm.comprovanteFile, `Comprovante_${acquireForm.comprovanteFile.name}`);
    }

    try {
      const response = await fetch('https://formsubmit.co/ajax/thiagoinfotech@gmail.com', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success === 'true' || result.success === true) {
        setFormSubmitted(true);
        // Também abre o WhatsApp como confirmação
        const whatsappMessage = `📋 *FORMULÁRIO DE AQUISIÇÃO - CONSÓRCIO*

*Cliente:* ${acquireForm.name || data.clientName}
*CPF:* ${acquireForm.cpf}
*Email:* ${acquireForm.email}
*Telefone:* ${acquireForm.phone}

*Crédito:* ${formatCurrency(data.creditValue)}
*Tipo:* ${isImobiliario ? '🏠 Imobiliário' : '🚗 Automóvel'}

✅ Documentos enviados por email!`;

        const encodedMessage = encodeURIComponent(whatsappMessage);
        window.open(`https://wa.me/5579981386285?text=${encodedMessage}`, '_blank');
      } else {
        throw new Error(result.message || 'Erro ao enviar formulário');
      }
    } catch (error) {
      console.error('Erro ao enviar:', error);
      setSendError('Não foi possível enviar por email. Tente novamente ou entre em contato pelo WhatsApp.');
      // Fallback: abre WhatsApp
      const whatsappMessage = `📋 *FORMULÁRIO DE AQUISIÇÃO - CONSÓRCIO*

*Cliente:* ${acquireForm.name || data.clientName}
*CPF:* ${acquireForm.cpf}
*Email:* ${acquireForm.email}
*Telefone:* ${acquireForm.phone}
*Endereço:* ${acquireForm.address || 'Não informado'}

*Crédito:* ${formatCurrency(data.creditValue)}
*Tipo:* ${isImobiliario ? '🏠 Imobiliário' : '🚗 Automóvel'}
*Taxa Adm.:* ${data.taxaAdministrativa}%
*Fundo Reserva:* ${data.fundoReserva}%

📎 *Documentos:*
${acquireForm.cnhFile ? `✅ CNH: ${acquireForm.cnhFile.name}` : '❌ CNH não informada'}
${acquireForm.comprovanteFile ? `✅ Comprovante: ${acquireForm.comprovanteFile.name}` : '❌ Comprovante não informado'}

_Desejo prosseguir com a aquisição do consórcio._

⚠️ Por favor, anexe os documentos manualmente nesta conversa.`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      window.open(`https://wa.me/5579981386285?text=${encodedMessage}`, '_blank');
      setFormSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  const isFormValid =
    acquireForm.name &&
    acquireForm.email &&
    acquireForm.phone &&
    acquireForm.cpf &&
    acquireForm.cnhFile &&
    acquireForm.comprovanteFile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Método Consórcio</h1>
              <p className="text-slate-400 text-xs">Proposta Personalizada</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-full px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="text-red-300 text-xs font-bold">
              ⚡ Válido por 24h
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Banner de Urgência */}
        <div className="bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl border-2 border-orange-500/50 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="relative flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-bold text-lg">🔥 OFERTA EXCLUSIVA - GRUPO EM ANDAMENTO</h3>
                <Clock className="w-5 h-5 text-orange-400 animate-pulse" />
              </div>
              <p className="text-orange-100 text-sm font-medium mb-2">
                Condição especial para grupo exclusivo com vagas limitadas!
              </p>
              <p className="text-orange-200/80 text-xs">
                ⚡ Aproveite esta oportunidade única. Vagas limitadas para este grupo com condições diferenciadas.
                <br />
                <span className="font-semibold text-orange-300">
                  Esta proposta é válida por apenas 24 horas!
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-white text-xl font-bold mb-1">
                Olá, {data.clientName}! 👋
              </h2>
              <p className="text-slate-300 text-sm">
                Preparei esta simulação personalizada de consórcio{' '}
                <span className="text-emerald-400 font-semibold">
                  {isImobiliario ? 'imobiliário' : 'de automóvel'}
                </span>{' '}
                para você. Confira os valores e condições especiais abaixo:
              </p>
            </div>
          </div>
        </div>

        {/* Mobile validity */}
        <div className="sm:hidden flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-full px-3 py-2 w-fit">
          <Clock className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span className="text-red-300 text-xs font-bold">
            ⚡ Válido por 24h
          </span>
        </div>

        {/* Credit Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              {isImobiliario ? (
                <Home className="w-5 h-5 text-emerald-200" />
              ) : (
                <Car className="w-5 h-5 text-emerald-200" />
              )}
              <p className="text-emerald-100 text-sm">
                Seu Crédito {isImobiliario ? 'Imobiliário' : 'Automóvel'}
              </p>
            </div>
            <p className="text-3xl sm:text-4xl font-bold mb-4">
              {formatCurrency(data.creditValue)}
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-emerald-200 text-xs">Prazo</p>
                <p className="text-white font-semibold">{data.months} meses</p>
              </div>
              <div>
                <p className="text-emerald-200 text-xs">Modalidade</p>
                <p className="text-white font-semibold">
                  {data.isParcelinha ? 'Parcelinha' : 'Tradicional'}
                </p>
              </div>
              <div>
                <p className="text-emerald-200 text-xs">Reajuste</p>
                <p className="text-white font-semibold">{indiceReajuste}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Imobiliário - Usos do crédito */}
        {isImobiliario && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-emerald-400" />
              O que você pode fazer com seu crédito
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              Com um único crédito imobiliário, você tem total flexibilidade para realizar seu
              sonho:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '🏠', text: 'Comprar um imóvel pronto' },
                { icon: '💰', text: 'Quitar financiamento existente' },
                { icon: '🏗️', text: 'Construir do zero' },
                { icon: '🔨', text: 'Reformar ou ampliar' },
                { icon: '🌍', text: 'Comprar terreno e construir' },
                { icon: '📋', text: 'Usar em qualquer finalidade imobiliária' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-slate-700/30 rounded-xl p-3"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-slate-200 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <p className="text-emerald-300 text-sm font-medium">
                ✨ Um único crédito para todas essas possibilidades!
              </p>
            </div>
          </div>
        )}

        {/* Taxa Administrativa */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <Percent className="w-5 h-5 text-violet-400" />
            Composição do Valor Total
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            As taxas são calculadas sobre o valor contratado (crédito total) e diluídas nas parcelas mensais.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Valor Contratado</p>
                  <p className="text-slate-400 text-xs">Carta de crédito total</p>
                </div>
              </div>
              <span className="text-emerald-400 font-bold text-lg">
                {formatCurrency(data.creditValue)}
              </span>
            </div>

            {data.lanceType === 'fixo' && (
              <>
                <div className="flex items-center justify-between bg-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">(-) Lance Embutido</p>
                      <p className="text-slate-400 text-xs">25% deduzido do crédito</p>
                    </div>
                  </div>
                  <span className="text-red-400 font-bold text-lg">
                    - {formatCurrency(lanceValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Valor Líquido</p>
                      <p className="text-slate-400 text-xs">Valor que você recebe</p>
                    </div>
                  </div>
                  <span className="text-blue-400 font-bold text-lg">
                    {formatCurrency(valorLiquidoReceber)}
                  </span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between bg-slate-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <Percent className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Taxa Administrativa</p>
                  <p className="text-slate-400 text-xs">{data.taxaAdministrativa}% sobre {formatCurrency(data.creditValue)}</p>
                </div>
              </div>
              <span className="text-violet-400 font-bold text-lg">
                {formatCurrency(taxaValor)}
              </span>
            </div>

            {data.fundoReserva > 0 && (
              <div className="flex items-center justify-between bg-slate-700/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Fundo de Reserva</p>
                    <p className="text-slate-400 text-xs">
                      {data.fundoReserva}% sobre {formatCurrency(data.creditValue)}
                    </p>
                  </div>
                </div>
                <span className="text-blue-400 font-bold text-lg">
                  {formatCurrency(fundoValor)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <PieChart className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Total a Pagar</p>
                  <p className="text-slate-400 text-xs">
                    {data.lanceType === 'fixo' ? 'Líquido' : 'Crédito'} + Encargos ({(data.taxaAdministrativa + data.fundoReserva).toFixed(1)}%)
                  </p>
                </div>
              </div>
              <span className="text-emerald-400 font-bold text-xl">
                {formatCurrency(totalGeral)}
              </span>
            </div>
          </div>

          <p className="text-slate-500 text-xs mt-3 text-center">
            💡 Os encargos são calculados sobre o valor contratado e diluídos nas parcelas
          </p>
        </div>

        {/* Lance Embutido - Seção Grande */}
        {data.lanceType === 'fixo' && (
          <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-2xl border-2 border-emerald-500/30 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Lance Embutido</h3>
                <p className="text-emerald-400 text-sm font-medium">25% do valor da carta</p>
              </div>
            </div>

            {/* Cálculo Visual Grande */}
            <div className="bg-slate-900/50 rounded-xl p-5 mb-4">
              <div className="space-y-4">
                {/* Valor da Carta */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Valor da Carta de Crédito</p>
                      <p className="text-slate-400 text-xs">Crédito total disponível</p>
                    </div>
                  </div>
                  <span className="text-white font-bold text-2xl">{formatCurrency(data.creditValue)}</span>
                </div>

                {/* Lance Embutido */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">(-) Lance Embutido (25%)</p>
                      <p className="text-slate-400 text-xs">Valor deduzido da carta</p>
                    </div>
                  </div>
                  <span className="text-red-400 font-bold text-2xl">- {formatCurrency(lanceValue)}</span>
                </div>

                {/* Valor Líquido - Destaque */}
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl p-4 border-2 border-emerald-500/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-emerald-300 font-bold text-lg">Valor Líquido a Receber</p>
                        <p className="text-emerald-400/70 text-xs">Valor que você recebe na conta</p>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold text-3xl">{formatCurrency(valorLiquidoReceber)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explicação */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Como funciona o lance embutido?</p>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    O lance embutido é utilizado para antecipar sua contemplação. O valor de <span className="text-emerald-400 font-semibold">{formatCurrency(lanceValue)}</span> é 
                    deduzido do valor total da carta, e você recebe o valor líquido de <span className="text-emerald-400 font-semibold">{formatCurrency(valorLiquidoReceber)}</span>. 
                    Essa é uma excelente estratégia para quem deseja ser contemplado mais rapidamente sem precisar usar recursos próprios.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lance Livre */}
        {data.lanceType === 'livre' && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Lance Livre
            </h3>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Lance com Recursos Próprios</p>
                  <p className="text-slate-400 text-xs">Do seu próprio bolso</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-sm">Valor do lance:</span>
                <span className="text-blue-400 font-bold text-xl">{formatCurrency(lanceValue)}</span>
              </div>
              <p className="text-slate-400 text-xs mt-3">
                💡 Com o lance livre, você usa recursos próprios para antecipar a contemplação e recebe o valor integral da carta.
              </p>
            </div>
          </div>
        )}

        {/* Reajuste Info com Índice do Ano Anterior */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
          <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-amber-400" />
            Reajuste Anual das Parcelas
          </h3>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 font-bold text-sm">{indiceReajuste}</span>
              </div>
              <div>
                <p className="text-white font-semibold">{indiceReajuste}</p>
                <p className="text-slate-400 text-xs">{indiceDescription}</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              {isImobiliario
                ? 'As parcelas do consórcio imobiliário são reajustadas anualmente pelo INCC (Índice Nacional de Custo da Construção), que reflete a variação dos custos do setor da construção civil.'
                : 'As parcelas do consórcio de automóveis são reajustadas anualmente pelo IPCA (Índice Nacional de Preços ao Consumidor Amplo), que acompanha a variação de preços do mercado automotivo.'}
            </p>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">{indiceNome} acumulado em 2025:</span>
                <span className="text-amber-400 font-bold">{indiceAnoAnterior.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Installments */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Condições de Pagamento
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">1ª Parcela</p>
                  <p className="text-slate-400 text-xs">Parcela de entrada</p>
                </div>
              </div>
              <span className="text-white font-bold text-lg">
                {formatCurrency(data.firstInstallment)}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 font-bold text-sm">2+</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Demais Parcelas</p>
                  <p className="text-slate-400 text-xs">
                    {data.months - 1} parcelas {data.isParcelinha ? '(antes da contemplação)' : 'de valor fixo'}
                  </p>
                </div>
              </div>
              <span className="text-white font-bold text-lg">
                {formatCurrency(data.otherInstallments)}
              </span>
            </div>

            {data.isParcelinha && data.postContemplationInstallment && (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Pós-Contemplação</p>
                    <p className="text-emerald-300 text-xs">Parcela reduzida após contemplação</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold text-lg">
                  {formatCurrency(data.postContemplationInstallment)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Valor contratado</span>
              <span className="text-white font-medium">
                {formatCurrency(data.creditValue)}
              </span>
            </div>
            {data.lanceType === 'fixo' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-red-400 text-sm">- Lance embutido (25%)</span>
                  <span className="text-red-400 text-sm">
                    - {formatCurrency(lanceValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-xl p-2">
                  <span className="text-blue-300 text-sm font-medium">Valor líquido</span>
                  <span className="text-blue-400 font-medium">
                    {formatCurrency(valorLiquidoReceber)}
                  </span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">+ Taxa administrativa ({data.taxaAdministrativa}%)</span>
              <span className="text-violet-400 text-sm">
                {formatCurrency(taxaValor)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">+ Fundo de reserva ({data.fundoReserva}%)</span>
              <span className="text-blue-400 text-sm">
                {formatCurrency(fundoValor)}
              </span>
            </div>
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mt-3">
              <span className="text-emerald-300 font-semibold">Total a pagar</span>
              <span className="text-white font-bold text-xl">
                {formatCurrency(totalGeral)}
              </span>
            </div>
            <p className="text-slate-500 text-xs text-center">
              ✅ Taxas calculadas sobre o valor contratado e diluídas nas parcelas
            </p>
          </div>
        </div>

        {/* Comparison */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            Comparativo: Consórcio vs Financiamento
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-sm">Consórcio</span>
              </div>
              <div className="space-y-2">
                {data.lanceType === 'fixo' ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Valor líquido:</span>
                      <span className="text-slate-300">{formatCurrency(valorLiquidoReceber)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">+ Taxa adm. ({data.taxaAdministrativa}%):</span>
                      <span className="text-slate-300">{formatCurrency(taxaValor)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">+ Fundo reserva ({data.fundoReserva}%):</span>
                      <span className="text-slate-300">{formatCurrency(fundoValor)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Crédito:</span>
                      <span className="text-slate-300">{formatCurrency(data.creditValue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">+ Taxa adm. ({data.taxaAdministrativa}%):</span>
                      <span className="text-slate-300">{formatCurrency(taxaValor)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">+ Fundo reserva ({data.fundoReserva}%):</span>
                      <span className="text-slate-300">{formatCurrency(fundoValor)}</span>
                    </div>
                  </>
                )}
                <div className="border-t border-emerald-500/20 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-emerald-300 font-semibold">Total:</span>
                    <span className="text-white font-bold text-xl">{formatCurrency(totalGeral)}</span>
                  </div>
                </div>
              </div>
              <p className="text-emerald-300 text-xs mt-3">
                ✅ Sem juros • Encargos diluídos • Reajuste {indiceReajuste}
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold text-sm">Financiamento*</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Valor financiado:</span>
                  <span className="text-slate-300">{formatCurrency(valorLiquidoParaFinanciamento)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Juros totais:</span>
                  <span className="text-slate-300">{formatCurrency(financing.totalInterest)}</span>
                </div>
                <div className="border-t border-red-500/20 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-red-300 font-semibold">Total:</span>
                    <span className="text-white font-bold text-xl">{formatCurrency(financing.totalPaid)}</span>
                  </div>
                </div>
              </div>
              <p className="text-red-300 text-xs mt-3">
                ❌ Com juros de {isImobiliario ? '11,40% a.a.' : '26% a.a.'} (SAC)
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4 text-center">
            <p className="text-emerald-300 text-sm mb-1">💰 Sua economia com consórcio</p>
            <p className="text-white text-3xl font-bold">{formatCurrency(economia)}</p>
            <p className="text-emerald-300 text-sm mt-1">
              {economiaPercent.toFixed(1)}% mais barato que o financiamento
            </p>
          </div>

          <p className="text-slate-500 text-xs mt-3 text-center">
            *Comparação baseada em financiamento SAC com taxas médias de mercado: Imobiliário 11,40% a.a. | Veículos 26% a.a.
            Valores ilustrativos.
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
          <h3 className="text-white font-semibold text-lg mb-4">✨ Vantagens do Consórcio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Sem cobrança de juros',
              'Parcelas que cabem no bolso',
              'Poder de compra à vista',
              'Planejamento financeiro',
              'Sem entrada obrigatória',
              'Liberdade de escolha',
              ...(isImobiliario
                ? ['Use para comprar, construir ou reformar', 'Crédito flexível']
                : ['Escolha qualquer veículo', 'Sem restrição de modelo']),
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Adquirir - Formulário */}
        <div className="bg-slate-800/50 rounded-2xl border border-emerald-500/30 p-6 backdrop-blur-sm">
          <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Adquirir meu Consórcio
          </h3>
          <p className="text-slate-400 text-sm mb-5">
            Preencha os dados abaixo e envie seus documentos. Nossa equipe entrará em contato em até 24h.
          </p>

          {!showAcquireForm && !formSubmitted && (
            <button
              onClick={() => setShowAcquireForm(true)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Quero Adquirir — Enviar Documentos
            </button>
          )}

          {formSubmitted && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h4 className="text-white font-bold text-lg mb-2">
                Documentos Enviados com Sucesso! 🎉
              </h4>
              <p className="text-slate-300 text-sm mb-4">
                Seus dados e documentos foram enviados. Nossa equipe entrará em contato em breve pelo WhatsApp.
              </p>
              <a
                href="https://wa.me/5579981386285"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all text-sm"
              >
                <Phone className="w-4 h-4" />
                Falar no WhatsApp
              </a>
            </div>
          )}

          {showAcquireForm && !formSubmitted && (
            <div className="space-y-4">
              {sendError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-300 text-sm">{sendError}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Nome Completo *</label>
                <input
                  type="text"
                  value={acquireForm.name}
                  onChange={(e) =>
                    setAcquireForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={data.clientName}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">CPF *</label>
                <input
                  type="text"
                  value={acquireForm.cpf}
                  onChange={(e) =>
                    setAcquireForm((prev) => ({ ...prev, cpf: e.target.value }))
                  }
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm mb-1.5 block">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={acquireForm.email}
                      onChange={(e) =>
                        setAcquireForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="seu@email.com"
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 text-sm mb-1.5 block">Telefone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      value={acquireForm.phone}
                      onChange={(e) =>
                        setAcquireForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="(79) 99999-9999"
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Endereço Completo</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={acquireForm.address}
                    onChange={(e) =>
                      setAcquireForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Rua, número, bairro, cidade - UF"
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-slate-300 text-sm font-medium block">
                  📎 Documentos Obrigatórios
                </label>

                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">CNH / Habilitação</p>
                      <p className="text-slate-400 text-xs">Frente e verso (PDF, JPG ou PNG)</p>
                    </div>
                  </div>
                  <input
                    ref={cnhInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('cnhFile', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {acquireForm.cnhFile ? (
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300 text-sm truncate max-w-[200px]">
                          {acquireForm.cnhFile.name}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleFileChange('cnhFile', null);
                          if (cnhInputRef.current) cnhInputRef.current.value = '';
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => cnhInputRef.current?.click()}
                      className="w-full py-2.5 rounded-lg border-2 border-dashed border-slate-600/50 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Anexar CNH
                    </button>
                  )}
                </div>

                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Comprovante de Residência</p>
                      <p className="text-slate-400 text-xs">Atualizado (PDF, JPG ou PNG)</p>
                    </div>
                  </div>
                  <input
                    ref={comprovanteInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleFileChange('comprovanteFile', e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                  {acquireForm.comprovanteFile ? (
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300 text-sm truncate max-w-[200px]">
                          {acquireForm.comprovanteFile.name}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleFileChange('comprovanteFile', null);
                          if (comprovanteInputRef.current) comprovanteInputRef.current.value = '';
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => comprovanteInputRef.current?.click()}
                      className="w-full py-2.5 rounded-lg border-2 border-dashed border-slate-600/50 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Anexar Comprovante
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmitAcquire}
                disabled={!isFormValid || sending}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold text-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Documentos
                  </>
                )}
              </button>

              <p className="text-slate-500 text-xs text-center">
                Seus dados e documentos serão enviados diretamente para nossa equipe.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm text-center">
          <h3 className="text-white font-semibold text-lg mb-2">
            Ficou com dúvidas, {data.clientName.split(' ')[0]}? 💬
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Entre em contato para tirar todas as suas dúvidas.
            <br />
            <span className="text-red-400 font-bold flex items-center justify-center gap-1 mt-2">
              <Clock className="w-4 h-4 animate-pulse" />
              ⚡ Proposta válida por apenas 24 horas!
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/5579981386285?text=Olá! Vi a simulação de consórcio ${isImobiliario ? 'imobiliário' : 'de automóvel'} no valor de ${formatCurrency(data.creditValue)} e gostaria de mais informações.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
            >
              <Phone className="w-5 h-5" />
              Falar no WhatsApp
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com/metodo.consorcio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all"
            >
              <Instagram className="w-5 h-5" />
              @metodo.consorcio
            </a>
          </div>

          <p className="text-slate-500 text-xs mt-4">
            Proposta elaborada por <span className="text-slate-300">{data.sellerName}</span>
          </p>
        </div>

        <footer className="text-center py-6 border-t border-slate-700/50">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} Método Consórcio • Todos os direitos reservados
          </p>
          <p className="text-slate-600 text-xs mt-1">
            Simulação meramente ilustrativa. Condições sujeitas à aprovação.
          </p>
        </footer>
      </main>
    </div>
  );
}
