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
    console.log(ageString);

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
            <div className="grid grid-cols-3 bg-[#1f3d56] text-white px-10">
                <div className="col-span-3 flex justify-between items-center">
                    <h1 className='text-5xl font-bold'>Rapor Member</h1>
                    <Image
                        src="/images/ppa-logo.png"
                        alt="Logo PPA"
                        width={200}
                        height={200}
                    />
                </div>
                <div className='col-span-3 flex items-center space-x-4 pb-10'>
                    <div className='w-48 h-48'>
                        <Image
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL_STORAGE}/${kid.photo?.replace('storage/', '')}`}
                            alt={kid.name}
                            width={400}
                            height={400}
                            className='w-full h-full object-contain rounded-full border-2'
                        />
                    </div>
                    <div className='space-y-4'>
                        <h1 className='text-3xl'>Nama</h1>
                        <h1 className='text-3xl'>Umur</h1>
                        <h1 className='text-3xl'>Cabang</h1>
                    </div>
                    <div className='space-y-4'>
                        <h1 className='text-3xl'>: {kid.name}</h1>
                        <h1 className='text-3xl'>: {ageString}</h1>
                        <h1 className='text-3xl'>: {branch.name}</h1>
                    </div>
                </div>
            </div>
            <div className='bg-gray-100 px-10 py-8'>
                <div className='flex justify-between bg-white px-6 py-4 rounded-lg shadow-lg'>
                    <h1 className='text-4xl font-semibold text-[#1f3d56]'>Evaluasi</h1>
                    <h1 className='text-4xl font-semibold text-[#1f3d56]'>{months_display}</h1>
                </div>
                
                {Object.entries(attendanceByClass).map(([classId, classData]) => (
                    <div key={classId} className='mt-8'>
                        <div className='bg-[#1f3d56] text-white px-6 py-3 rounded-t-lg mb-4'>
                            <h2 className='text-2xl font-bold'>
                                Kelas: 
                                {classData.class_info?.sport && ` ${classData.class_info.sport.name}`}
                                {classData.class_info?.category && ` (${classData.class_info.category.name})`}
                            </h2>
                        </div>

                        <div className='space-y-6'>
                            {classData.reports?.length > 0 ? (
                                classData.reports.map((item) => (
                                    <div
                                        key={item.id}
                                        className="grid grid-cols-4 border rounded-lg bg-[#1f3d56] shadow-md h-70"
                                    >
                                        <div className='relative w-full h-full rounded-lg'>
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL_STORAGE}/${item.coach.photo?.replace('storage/', '')}`}
                                                alt={item.coach.name}
                                                width={500}
                                                height={500}
                                                className='w-full h-full object-cover rounded-md'
                                            />
                                            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 w-full text-center'>
                                                <p className='bg-black/50 text-white px-2 py-1 font-bold'>
                                                    Coach {item.coach.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='col-span-3 grid grid-cols-3 py-6 px-8 gap-8'>
                                            <div className='space-y-2'>
                                                <p className='text-lg text-center bg-white font-bold rounded-lg'>Motorik</p>
                                                <p className='text-left text-white text-sm'>{item.motorik}</p>
                                            </div>
                                            <div className='space-y-2'>
                                                <p className='text-lg text-center bg-white font-bold rounded-lg'>Locomotor</p>
                                                <p className='text-left text-white text-sm'>{item.locomotor}</p>
                                            </div>
                                            <div className='space-y-2'>
                                                <p className='text-lg text-center bg-white font-bold rounded-lg'>Body Control</p>
                                                <p className='text-left text-white text-sm'>{item.body_control}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
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