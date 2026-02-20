import Image from 'next/image';

export interface ReportResponse {
    play_kid: PlayKid;
    branch: Branch;
    classes: ClassWithCategory[];
    attendance_reports: AttendanceReport[];
    attendance_count: number;
    months: string[];
    months_display: string;
}

export interface PlayKid {
    id: number;
    name: string;
    nick_name: string | null;
    birth_date: string;
    gender: "M" | "F" | string;
    school_origin: string | null;
    photo?: string | null;
    medical_history?: string | null;
}

export interface Branch {
    id: number;
    name: string;
    description: string | null;
}

export interface ClassWithCategory {
    id: number;
    name: string;
    sport_id: number;
    category_id: number;
    category: Category | null;
    sport: Sport | null;
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
}

export interface Sport {
    id: number;
    name: string;
}

export interface AttendanceReport {
    id: number;
    class_id: number;
    class_name: string;
    date: string;
    start_time: string;
    end_time: string;
    attendance: number;
    motorik: string | null;
    locomotor: string | null;
    body_control: string | null;
    overall: number | null;
    coach: CoachSummary;
    month_year: string;
}

export interface CoachSummary {
    id: number;
    user_id: number;
    name: string;
    photo?: string | null;
}

interface ReportPDFProps {
    report: ReportResponse;
}

export function ReportPDF({ report }: ReportPDFProps) {
    console.log("Report Data : ", report);

    const { branch, classes, attendance_reports: attendance, play_kid: kid, months_display } = report;

    const birthDate = new Date(kid.birth_date);
    const now = new Date();

    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();

    if (months < 0) {
        years--;
        months += 12;
    }

    const ageString = `${years} tahun ${months} bulan`;

    const attendanceByClass = attendance.reduce((acc, item) => {
        if (!acc[item.class_id]) {
            acc[item.class_id] = {
                class_name: item.class_name,
                class_info: classes.find(cls => cls.id === item.class_id),
                reports: []
            };
        }
        acc[item.class_id].reports.push(item);
        return acc;
    }, {} as Record<number, { class_name: string; class_info: ClassWithCategory | undefined; reports: AttendanceReport[] }>);

    return (
        <div className="w-full">
            <div className="bg-[#1f3d56] text-white px-10 pb-10">
                {/* TOP BAR */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-5xl font-bold">Rapor Bulanan</h1>
                        <p className="text-lg text-white/80 mt-2">
                            Periode : {months_display}
                        </p>
                    </div>

                    <Image
                        src="/images/ppa-logo.png"
                        alt="Logo PPA"
                        width={180}
                        height={180}
                    />
                </div>

                {/* KID PROFILE */}
                <div className="flex items-center gap-8">
                    {/* FOTO ANAK */}
                    <div className="w-44 h-44 shrink-0">
                        <Image
                            src={
                                kid.photo
                                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL_STORAGE}/${kid.photo.replace('storage/', '')}`
                                    : '/images/playkids-avatar.png'
                            }
                            alt={kid.name}
                            width={400}
                            height={400}
                            className="w-full h-full object-cover rounded-full border-4 border-white/30"
                        />
                    </div>

                    {/* INFO ANAK */}
                    <div className="space-y-3 text-xl">
                        <p>
                            <span className="text-white/70">Nama</span>
                            <span className="mx-2">:</span>
                            <span className="font-semibold">{kid.name}</span>
                        </p>

                        <p>
                            <span className="text-white/70">Umur</span>
                            <span className="mx-2">:</span>
                            <span className="font-semibold">{ageString}</span>
                        </p>

                        <p>
                            <span className="text-white/70">Cabang</span>
                            <span className="mx-2">:</span>
                            <span className="font-semibold">{branch.name}</span>
                        </p>
                    </div>
                </div>
            </div>
            <div className='bg-gray-100 px-10 pt-8 pb-2'>
                {Object.entries(attendanceByClass).map(([classId, classData]) => (
                    <div key={classId} className='mb-8'>
                        <div className='space-y-6'>
                            {classData.reports?.length > 0 ? (
                                classData.reports.map((item) => {
                                    const coachSrc = item.coach?.photo
                                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL_STORAGE}/${item.coach.photo.replace('storage/', '')}`
                                        : '/images/coach-avatar.png';

                                    const formatDateDMY = (date?: string | null) => {
                                        if (!date) return '-'

                                        const [year, month, day] = date.split('-')
                                        if (!year || !month || !day) return date

                                        return `${day}-${month}-${year}`
                                    }

                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-[#1f3d56] rounded-xl shadow-lg overflow-hidden p-4"
                                        >
                                            <div className="grid grid-cols-4 gap-4 items-start">
                                                {/* FOTO COACH */}
                                                <div className="col-span-1 h-full">
                                                    <Image
                                                        src={coachSrc}
                                                        alt={item.coach?.name ?? 'Coach'}
                                                        width={500}
                                                        height={500}
                                                        className="w-full h-full object-cover rounded-lg border-2 border-white/20"
                                                    />
                                                </div>

                                                {/* KONTEN KANAN */}
                                                <div className="col-span-3 flex flex-col">
                                                    {/* header bar: coach name + kelas + tanggal */}
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-white/70">Coach</p>
                                                            <h3 className="text-sm font-bold text-white">{item.coach?.name ?? '-'}</h3>
                                                            <p className="text-xs text-white/70 mt-1">
                                                                {classData.class_info?.sport?.name}
                                                                {classData.class_info?.category ? ` — ${classData.class_info.category.name}` : ''}
                                                            </p>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="text-xs text-white/70">Tanggal</p>
                                                            <p className="text-sm font-semibold text-white/90">{formatDateDMY(item.date)}</p>
                                                        </div>
                                                    </div>

                                                    {/* PENILAIAN: tiga kotak */}
                                                    <div className="mt-4 grid grid-cols-3 gap-4">
                                                        {/* Card template */}
                                                        <div className="bg-white rounded-lg p-3 shadow-sm min-h-[140px] flex flex-col">
                                                            <p className="text-sm font-semibold text-center mb-2">
                                                                Motoric
                                                            </p>

                                                            <div className="flex-1 flex items-center justify-center">
                                                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-800 text-center">
                                                                    {item.motorik ?? '-'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="bg-white rounded-lg p-3 shadow-sm min-h-[140px] flex flex-col">
                                                            <p className="text-sm font-semibold text-center mb-2">
                                                                Locomotor
                                                            </p>

                                                            <div className="flex-1 flex items-center justify-center">
                                                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800 text-center">
                                                                    {item.locomotor ?? '-'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="bg-white rounded-lg p-3 shadow-sm min-h-[140px] flex flex-col">
                                                            <p className="text-sm font-semibold text-center mb-2">
                                                                Body Control
                                                            </p>

                                                            <div className="flex-1 flex items-center justify-center">
                                                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-md bg-sky-100 text-sky-800 text-center">
                                                                    {item.body_control ?? '-'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 italic">Belum ada data kehadiran.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}