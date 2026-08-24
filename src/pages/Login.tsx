
import { Shield, Users, Database, Link as LinkIcon, ChevronRight } from 'lucide-react';
import AuthCard from '../components/AuthCard';

const Login = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="md:w-[45%] lg:w-1/2 bg-slate-900 text-white flex flex-col justify-between p-8 md:p-12 lg:p-16 relative overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600 blur-[120px]"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500 blur-[100px]"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-wide leading-none">BEL</h1>
              <span className="text-xs text-blue-300 font-semibold tracking-widest uppercase">Trust Platform</span>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Secure access.<br />
              <span className="text-blue-400">Verified identity.</span><br />
              Trusted operations.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-12">
              A secure digital trust platform connecting identity, access control, digital assets and blockchain verification.
            </p>

            {/* Visual flow */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hidden md:block">
              <div className="flex items-center justify-between text-sm font-medium text-slate-300">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <span>Identity</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600" />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span>Access</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600" />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <Database className="w-5 h-5 text-purple-400" />
                  </div>
                  <span>Assets</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600" />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span>Blockchain</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 md:mt-0 text-sm text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} Bharat Electronics Limited.
        </div>
      </div>

      {/* Right side - Login */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-3xl -z-10"></div>
        <AuthCard />
      </div>
    </div>
  );
};

export default Login;
