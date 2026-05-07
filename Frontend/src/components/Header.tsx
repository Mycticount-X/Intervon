import { useState, type Dispatch, type SetStateAction } from "react";
import { Menu, ChevronDown } from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

interface RoleOption {
  full: string;
  short: string;
}

type LevelOption = "Junior" | "Senior" | "Lead";

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const [selectedRole, setSelectedRole] = useState<string>("Software Engineer");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false);

  const [selectedLevel, setSelectedLevel] = useState<LevelOption>("Junior");
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState<boolean>(false);

  const roleOptions: RoleOption[] = [
    { full: "Software Engineer", short: "S.E." },
    { full: "UI/UX Designer", short: "UI/UX" },
    { full: "Data Analyst", short: "D.A." },
    { full: "Product Manager", short: "P.M." }
  ];

  const levelOptions: LevelOption[] = ["Junior", "Senior", "Lead"];

  const currentShortRole = roleOptions.find(r => r.full === selectedRole)?.short;

  return (
    <header className="h-[72px] border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center shrink-0">
      <div className="w-full px-6 flex items-center justify-between">
        
        {/* Bagian Kiri */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500"
          >
            <Menu className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight hidden sm:block">
            Intervon
          </h1>
        </div>

        {/* Bagian Kanan */}
        <div className="flex items-center gap-3">
          
          {/* Role */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsRoleDropdownOpen(!isRoleDropdownOpen);
                setIsLevelDropdownOpen(false); 
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <span className="text-slate-700 text-sm font-medium hidden sm:inline">{selectedRole}</span>
              <span className="text-slate-700 text-sm font-medium sm:hidden">{currentShortRole}</span>
              <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRoleDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsRoleDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 py-1">
                  {roleOptions.map((role, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedRole(role.full);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
                        selectedRole === role.full ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      {role.full}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Level */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsLevelDropdownOpen(!isLevelDropdownOpen);
                setIsRoleDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <span className="text-slate-700 text-sm font-medium">{selectedLevel}</span>
              <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${isLevelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLevelDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsLevelDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 py-1">
                  {levelOptions.map((level, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedLevel(level);
                        setIsLevelDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
                        selectedLevel === level ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
        </div>
      </div>
    </header>
  );
}