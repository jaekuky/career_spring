import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { JOB_CATEGORIES } from '@/constants/jobs';
import type { AnalysisInput } from '@/types/analysis';
import { ArrowLeft, Clock, HelpCircle, X } from 'lucide-react';

const skillSuggestions = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Vue.js', 'Node.js',
  'SQL', 'AWS', 'Docker', 'Figma', 'Google Ads', 'SEO', 'Excel'
];

// Edge Function의 ALLOWED_EDUCATION과 동일한 값 사용
const educationOptions = ['고졸', '전문대졸', '대졸', '대학원졸(석사)', '대학원졸(박사)', '기타'];

const Analysis = () => {
  const navigate = useNavigate();
  const { setCurrentInput } = useAnalysis();

  const [jobTitle, setJobTitle] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [achievements, setAchievements] = useState('');
  const [education, setEducation] = useState('');

  const filledFields = [jobTitle, yearsOfExperience > 0, skills.length > 0, education].filter(Boolean).length;
  const progress = (filledFields / 4) * 100;

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSubmit = () => {
    const input: AnalysisInput = {
      jobTitle,
      yearsOfExperience,
      skills,
      achievements: achievements.trim() || undefined,
      education,
    };
    setCurrentInput(input);
    navigate('/analysis/loading');
  };

  const isValid = jobTitle && yearsOfExperience > 0 && skills.length > 0 && education;

  return (
    <AppLayout showNav={false}>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-foreground">시장 가치 분석</h1>
          <span className="text-sm text-muted-foreground">1/3</span>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-muted rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Intro */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-2">경력 정보를 입력해주세요</h2>
          <p className="text-muted-foreground mb-3">정확한 정보를 입력할수록 분석 결과가 정확해져요</p>
          <div className="inline-flex items-center gap-2 bg-accent px-3 py-1.5 rounded-full text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-accent-foreground">약 1분 소요</span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6 animate-fade-in-up">
          {/* Job Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-foreground font-medium">현재 직무 *</Label>
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            <Select value={jobTitle} onValueChange={setJobTitle}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="직무를 선택해주세요" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {Object.values(JOB_CATEGORIES).map(({ label: categoryLabel, roles }) => (
                  <div key={categoryLabel}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {categoryLabel}
                    </div>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Years of Experience */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-foreground font-medium">총 경력 연차 *</Label>
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            <Select value={yearsOfExperience.toString()} onValueChange={(v) => setYearsOfExperience(parseInt(v))}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="경력 연차를 선택해주세요" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}년{year >= 10 ? '+' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-foreground font-medium">핵심 기술 스택 *</Label>
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button type="button" aria-label={`${skill} 제거`} onClick={() => removeSkill(skill)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {skillSuggestions.filter(s => !skills.includes(s)).slice(0, 8).map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addSkill(skill)}
                  className="px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-foreground font-medium">대표 성과/프로젝트</Label>
              <span className="text-xs text-muted-foreground">(선택)</span>
            </div>
            <Textarea
              placeholder="예: 결제 시스템 구축으로 매출 30% 증가, MAU 10만 앱 런칭 등"
              value={achievements}
              onChange={(e) => setAchievements(e.target.value.slice(0, 500))}
              className="bg-card min-h-[100px]"
            />
            <div className="text-right text-xs text-muted-foreground mt-1">
              {achievements.length}/500
            </div>
          </div>

          {/* Education */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-foreground font-medium">최종 학력 *</Label>
            </div>
            <Select value={education} onValueChange={setEducation}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="학력을 선택해주세요" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {educationOptions.map(edu => (
                  <SelectItem key={edu} value={edu}>{edu}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 pb-8">
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            variant="hero"
            size="xl"
            className="w-full"
          >
            30초 분석 시작하기
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Analysis;
