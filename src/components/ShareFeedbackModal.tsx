import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

const DIRECTION_TAGS = [
  '提分经验与心得',
  '优秀教学备课案例',
  '系统高效使用妙招',
  '班级与学情管理',
  '日常教学吐槽树洞',
  '其他',
] as const;

const DESC_PLACEHOLDER =
  '例如：我是如何利用系统的数据报告，帮助班级里某位后进生在一个月内提升了15分的...（运营小助手看到后会优先与您联系，协助您整理成精美帖子并获得专属曝光哦～）';

const MAX_DESC = 500;
const MAX_IMAGES = 4;

/** 中国大陆手机号 11 位，1 开头第二位 3–9 */
const PHONE_PATTERN = /^1[3-9]\d{9}$/;

/** 微信号：字母开头，总长 6–20，仅字母数字下划线连字符 */
const WECHAT_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/;

const SUCCESS_MODAL_BODY =
  '感谢您的分享，优质内容入选后，运营小助手会在两个工作日与您联系哦～';

type ContactChannel = 'phone' | 'wechat';

type Props = {
  open: boolean;
  onClose: () => void;
};

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="text-gray-1">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 对齐 Figma info_success（green-1 #4DE03F） */
function SuccessCircleCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden className="shrink-0">
      <circle cx="10" cy="10" r="10" fill="#4DE03F" />
      <path
        d="M5.5 10.2l2.8 2.8L14.5 6.8"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon({ className = 'text-primary-1', size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ShareFeedbackModal({ open, onClose }: Props) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [description, setDescription] = useState('');
  const [contactChannel, setContactChannel] = useState<ContactChannel>('phone');
  const [phone, setPhone] = useState('');
  const [wechatId, setWechatId] = useState('');
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState(false);

  const toggleTag = useCallback((label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const onFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    setImages((prev) => {
      const next = [...prev];
      for (const f of Array.from(files)) {
        if (!f.type.startsWith('image/')) continue;
        if (next.length >= MAX_IMAGES) break;
        next.push({ file: f, url: URL.createObjectURL(f) });
      }
      return next;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const x = prev[index];
      if (x) URL.revokeObjectURL(x.url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const dismissSuccessAndClose = useCallback(() => {
    setSuccessModal(false);
    onClose();
  }, [onClose]);

  /** 与 handleSubmit 校验一致；未满足时主按钮 disable（稿面 primary-4 #BBCBFC） */
  const canSubmit = useMemo(() => {
    if (selected.size === 0) return false;
    const t = description.trim();
    if (!t || t.length > MAX_DESC) return false;
    if (contactChannel === 'phone') {
      const p = phone.replace(/\s/g, '');
      return PHONE_PATTERN.test(p);
    }
    const w = wechatId.trim();
    return WECHAT_PATTERN.test(w);
  }, [contactChannel, description, phone, selected.size, wechatId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (successModal) {
        e.preventDefault();
        dismissSuccessAndClose();
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, successModal, dismissSuccessAndClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setSubmitError(null);
  }, [open]);

  useEffect(() => {
    if (open) return;
    setImages((prev) => {
      prev.forEach((i) => URL.revokeObjectURL(i.url));
      return [];
    });
    setSelected(new Set());
    setDescription('');
    setContactChannel('phone');
    setPhone('');
    setWechatId('');
    setSubmitError(null);
    setSuccessModal(false);
  }, [open]);

  const handleSubmit = useCallback(() => {
    if (selected.size === 0) {
      setSubmitError('请至少选择一项分享方向');
      return;
    }
    const t = description.trim();
    if (!t) {
      setSubmitError('请填写描述');
      return;
    }
    if (t.length > MAX_DESC) {
      setSubmitError(`描述请在 ${MAX_DESC} 字以内`);
      return;
    }
    if (contactChannel === 'phone') {
      const p = phone.replace(/\s/g, '');
      if (!p) {
        setSubmitError('请填写手机号码');
        return;
      }
      if (!PHONE_PATTERN.test(p)) {
        setSubmitError('请输入正确的 11 位手机号码');
        return;
      }
    } else {
      const w = wechatId.trim();
      if (!w) {
        setSubmitError('请填写微信号');
        return;
      }
      if (!WECHAT_PATTERN.test(w)) {
        setSubmitError('微信号需以字母开头，6–20 位，仅支持字母、数字、下划线与连字符');
        return;
      }
    }
    setSubmitError(null);
    setSuccessModal(true);
  }, [contactChannel, description, phone, selected.size, wechatId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        aria-label="关闭"
        className="absolute inset-0 bg-black/35"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full max-w-[520px] flex-col bg-fill-light shadow-high"
      >
        <header className="flex shrink-0 items-center gap-2 bg-transparent px-6 py-6">
          <h2 id={titleId} className="min-w-0 flex-1 text-[20px] font-semibold leading-[1.5] text-gray-1">
            我要投稿
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] text-gray-1 transition-colors hover:bg-fill-gray-1"
            aria-label="关闭"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 pt-0">
          <div className="flex flex-col gap-5">
            <section className="rounded-[16px] border border-line-1 bg-white p-5">
              <p className="text-[16px] font-semibold leading-[1.5] text-gray-1">
                <span className="text-[#e0443f]">* </span>
                请选择您想分享的内容方向（可多选）
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {DIRECTION_TAGS.map((tag) => {
                  const on = selected.has(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`h-9 min-w-0 rounded-[6px] border px-5 text-[14px] font-medium leading-[1.5] transition-colors ${
                        on
                          ? 'border-primary-2 bg-primary-6 text-primary-1'
                          : 'border-line-3 bg-white text-gray-2 hover:border-line-2'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[16px] border border-line-1 bg-white p-5">
              <p className="text-[16px] font-semibold leading-[1.5] text-gray-1">
                <span className="text-[#e0443f]">* </span>
                请简要描述您的故事或经验
              </p>
              <div className="mt-4 rounded-[6px] border border-line-3 bg-white">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
                  placeholder={DESC_PLACEHOLDER}
                  rows={5}
                  className="min-h-[120px] w-full resize-none bg-transparent px-3 py-2 text-[14px] leading-[1.5] text-gray-1 placeholder:text-gray-4 focus:outline-none"
                />
                <div className="flex justify-end px-2 pb-2">
                  <span className="text-[12px] tabular-nums text-gray-4">
                    {description.length}/{MAX_DESC} 字
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-[16px] border border-line-1 bg-white p-5">
              <p className="text-[16px] font-semibold leading-[1.5] text-gray-1">上传相关图片</p>
              <p className="mt-1 text-[14px] leading-[1.5] text-[#838bab]">
                可上传成绩对比、提分喜报、课堂照片、备课截图等。
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => onFiles(e.target.files)}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img.url}
                    className="relative size-[90px] overflow-hidden rounded-[6px] border border-line-2"
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-[12px] text-white"
                      aria-label="移除图片"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex size-[90px] flex-col items-center justify-center gap-3 rounded-[6px] border border-line-2 bg-white text-gray-4 transition-colors hover:border-line-3 hover:bg-fill-gray-1"
                  >
                    <PlusIcon size={19} className="text-gray-4" />
                    <span className="max-w-[70px] text-center text-[14px] font-normal leading-[1.5] text-gray-4">
                      可上传{MAX_IMAGES - images.length}张
                    </span>
                  </button>
                ) : null}
              </div>
            </section>

            <section className="rounded-[16px] border border-line-1 bg-white p-5">
              <p className="text-[16px] font-semibold leading-[1.5] text-gray-1">
                <span className="text-[#e0443f]">* </span>
                联系方式
              </p>
              <p className="mt-1 text-[14px] leading-[1.5] text-[#838bab]">
                请选择一种方式，便于运营小助手与您联系。
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-6" role="radiogroup" aria-label="联系方式类型">
                <label className="flex cursor-pointer items-center gap-2 text-[14px] leading-[1.5] text-gray-2">
                  <input
                    type="radio"
                    name="contact-channel"
                    checked={contactChannel === 'phone'}
                    onChange={() => setContactChannel('phone')}
                    className="h-4 w-4 shrink-0 accent-primary-2"
                  />
                  电话
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[14px] leading-[1.5] text-gray-2">
                  <input
                    type="radio"
                    name="contact-channel"
                    checked={contactChannel === 'wechat'}
                    onChange={() => setContactChannel('wechat')}
                    className="h-4 w-4 shrink-0 accent-primary-2"
                  />
                  微信
                </label>
              </div>
              {contactChannel === 'phone' ? (
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="请输入 11 位手机号码"
                  className="mt-4 h-10 w-full rounded-[6px] border border-line-3 px-3 text-[14px] text-gray-1 placeholder:text-gray-4 focus:border-primary-2 focus:outline-none"
                />
              ) : (
                <input
                  type="text"
                  value={wechatId}
                  onChange={(e) => setWechatId(e.target.value.slice(0, 20))}
                  placeholder="字母开头，6–20 位，支持数字、下划线、连字符"
                  className="mt-4 h-10 w-full rounded-[6px] border border-line-3 px-3 text-[14px] text-gray-1 placeholder:text-gray-4 focus:border-primary-2 focus:outline-none"
                />
              )}
            </section>

            {submitError ? (
              <p className="text-center text-[14px] text-[#e0443f]" role="alert">
                {submitError}
              </p>
            ) : null}
          </div>
        </div>

        <footer className="shrink-0 border-t border-line-1 bg-white px-6 py-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || successModal}
            className="flex h-9 w-full min-w-[76px] items-center justify-center rounded-[18px] bg-primary-2 px-5 text-[14px] font-medium leading-[1.5] text-white transition-[filter] hover:brightness-[0.96] active:brightness-[0.9] disabled:cursor-not-allowed disabled:bg-primary-4 disabled:text-white disabled:hover:brightness-100 disabled:active:brightness-100"
          >
            提交
          </button>
        </footer>
      </div>

      {successModal ? (
        <>
          <button
            type="button"
            aria-label="关闭"
            className="fixed inset-0 z-[80] bg-black/35"
            onClick={dismissSuccessAndClose}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${titleId}-success`}
            className="fixed left-1/2 top-1/2 z-[90] flex w-[min(100vw-32px,400px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-6 rounded-[16px] border-[0.5px] border-solid border-line-1 bg-white px-6 pb-5 pt-6 shadow-m"
          >
            <div className="flex w-full flex-col gap-2">
              <div className="flex items-center gap-2">
                <SuccessCircleCheckIcon />
                <h3
                  id={`${titleId}-success`}
                  className="text-[20px] font-semibold leading-[1.5] text-gray-1"
                >
                  提交成功！
                </h3>
              </div>
              <p className="pl-7 text-left text-[14px] font-normal leading-[1.5] text-gray-2">
                {SUCCESS_MODAL_BODY}
              </p>
            </div>
            <div className="flex w-full shrink-0 justify-end gap-3">
              <button
                type="button"
                onClick={dismissSuccessAndClose}
                className="flex h-9 min-w-[76px] shrink-0 items-center justify-center rounded-[18px] border border-solid border-line-2 bg-white px-5 text-[14px] font-medium leading-[1.5] text-gray-2 transition-colors hover:bg-fill-gray-1"
              >
                取消
              </button>
              <button
                type="button"
                onClick={dismissSuccessAndClose}
                className="flex h-9 min-w-[76px] shrink-0 items-center justify-center rounded-[18px] bg-primary-2 px-5 text-[14px] font-medium leading-[1.5] text-white transition-[filter] hover:brightness-[0.96] active:brightness-[0.9]"
              >
                确认
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
