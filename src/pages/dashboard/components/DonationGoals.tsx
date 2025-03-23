import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { goals as goalsApi } from '../../../lib/goals';
import { toast } from 'react-hot-toast';

interface DonationGoal {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  active: boolean;
}

interface DonationGoalsProps {
  userId: string;
  formatCurrency: (amount: number) => string;
}

const DonationGoals: React.FC<DonationGoalsProps> = ({ userId, formatCurrency }) => {
  const [goalsList, setGoalsList] = useState<DonationGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<DonationGoal | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadGoals();
  }, [userId]);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const response = await goalsApi.getByUserId(userId);
      if (response.success && response.data) {
        setGoalsList(response.data as DonationGoal[]);
      } else {
        toast.error('Nie udało się załadować celów');
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Wystąpił błąd podczas ładowania celów');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const goalData = {
        title: formData.title,
        description: formData.description,
        target_amount: parseInt(formData.target_amount) * 100, // Convert to cents
        start_date: formData.start_date,
        end_date: formData.end_date,
        user_id: userId
      };

      let response;
      if (editingGoal) {
        response = await goalsApi.update(editingGoal.id, goalData);
        if (response.success) {
          toast.success('Cel został zaktualizowany');
        }
      } else {
        response = await goalsApi.create(goalData);
        if (response.success) {
          toast.success('Nowy cel został dodany');
        }
      }

      if (!response.success) {
        throw new Error(response.error);
      }

      setFormData({
        title: '',
        description: '',
        target_amount: '',
        start_date: '',
        end_date: ''
      });
      setIsAddingGoal(false);
      setEditingGoal(null);
      loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Wystąpił błąd podczas zapisywania celu');
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten cel?')) return;
    
    try {
      const response = await goalsApi.delete(goalId);
      if (response.success) {
        toast.success('Cel został usunięty');
        loadGoals();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Wystąpił błąd podczas usuwania celu');
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-500" />
          Cele zbiórki
        </h2>
        {!isAddingGoal && !editingGoal && (
          <button
            onClick={() => setIsAddingGoal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Dodaj cel
          </button>
        )}
      </div>

      {(isAddingGoal || editingGoal) && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tytuł</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Opis</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Kwota docelowa (PLN)</label>
            <input
              type="number"
              min="1"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data rozpoczęcia</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Data zakończenia</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddingGoal(false);
                setEditingGoal(null);
                setFormData({
                  title: '',
                  description: '',
                  target_amount: '',
                  start_date: '',
                  end_date: ''
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              {editingGoal ? 'Zapisz zmiany' : 'Dodaj cel'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : goalsList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nie masz jeszcze żadnych celów zbiórki.</p>
          <p className="text-sm">Dodaj swój pierwszy cel, aby zmotywować darczyńców!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {goalsList.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{goal.title}</h3>
                  <p className="text-sm text-gray-500">{goal.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setFormData({
                        title: goal.title,
                        description: goal.description,
                        target_amount: (goal.target_amount / 100).toString(),
                        start_date: goal.start_date.split('T')[0],
                        end_date: goal.end_date.split('T')[0]
                      });
                    }}
                    className="p-1.5 text-gray-500 hover:text-orange-500 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Postęp</span>
                  <span className="font-medium">
                    {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                  </span>
                </div>
                
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${calculateProgress(goal.current_amount, goal.target_amount)}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    {goal.active ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>{goal.active ? 'Aktywny' : 'Zakończony'}</span>
                  </div>
                  <span>
                    {new Date(goal.end_date).toLocaleDateString('pl-PL')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationGoals; 