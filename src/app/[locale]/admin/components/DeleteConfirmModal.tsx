import React from 'react';

interface DeleteConfirmModalProps {
  userName: string;
  locale: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ 
  userName, 
  locale, 
  onConfirm, 
  onCancel 
}: DeleteConfirmModalProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '15px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
        border: '3px solid #e74c3c'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          margin: '0 auto 2rem auto',
          color: 'white'
        }}>
          ⚠️
        </div>
        
        <h2 style={{
          fontSize: '1.8rem',
          color: '#e74c3c',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          {locale === 'ar-SA' ? 'تأكيد الحذف' : 'Confirm Delete'}
        </h2>
        
        <p style={{
          fontSize: '1.2rem',
          color: '#666',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          {locale === 'ar-SA' 
            ? `هل أنت متأكد من أنك تريد حذف المستخدم "${userName}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete user "${userName}"? This action cannot be undone.`
          }
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '1rem 2rem',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '120px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#7f8c8d';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#95a5a6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 5px 15px rgba(231, 76, 60, 0.3)',
              minWidth: '120px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(231, 76, 60, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(231, 76, 60, 0.3)';
            }}
          >
            🗑️ {locale === 'ar-SA' ? 'حذف' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
