import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

interface Notif {
  id: string;
  type: 'bid_outbid' | 'auction_win' | 'bet_result' | 'race_start' | 'system' | 'deposit';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const NOTIFS: Notif[] = [
  { id: '1', type: 'bid_outbid',   title: 'تم تجاوز عرضك!',           body: 'تم تجاوز مزايدتك على الجواد شاهين — المزاد ينتهي خلال 5 دقائق.',     time: 'منذ 3 دقائق', read: false },
  { id: '2', type: 'race_start',   title: 'السباق يبدأ خلال 30 دقيقة', body: 'كأس النيل — الجواد الذي راهنت عليه مستعد. تابع السباق مباشرة.',       time: 'منذ 12 دقيقة', read: false },
  { id: '3', type: 'bet_result',   title: '🏆 فزت برهانك!',            body: 'رهانك على الجواد بدران في جائزة الربيع ربح! تم إضافة 28,000 ج.م لمحفظتك.', time: 'منذ ساعة', read: false },
  { id: '4', type: 'deposit',      title: 'تم الإيداع بنجاح',          body: 'تمت إضافة 50,000 ج.م إلى محفظتك بنجاح.',                            time: 'منذ 3 ساعات', read: true },
  { id: '5', type: 'auction_win',  title: 'فزت بالمزاد!',              body: 'تهانينا! فزت بمزاد الجواد النسر بسعر 310,000 ج.م. سيتواصل معك الفريق لإتمام البيع.', time: 'أمس', read: true },
  { id: '6', type: 'system',       title: 'تحديث في الشروط',           body: 'تم تحديث شروط وأحكام المراهنات. اضغط للاطلاع.',                       time: 'منذ يومين', read: true },
  { id: '7', type: 'bid_outbid',   title: 'تم تجاوز عرضك',             body: 'مزايدتك على الفرس ديم تم تجاوزها. العرض الحالي: 195,000 ج.م.',          time: 'منذ 3 أيام', read: true },
];

const TYPE_CONFIG: Record<Notif['type'], { icon: string; color: string }> = {
  bid_outbid:  { icon: '⚡', color: Colors.live },
  auction_win: { icon: '🏆', color: Colors.gold },
  bet_result:  { icon: '💰', color: Colors.successLight },
  race_start:  { icon: '🏇', color: Colors.gold },
  system:      { icon: '🔔', color: Colors.textSecondary },
  deposit:     { icon: '💳', color: Colors.successLight },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifs, setNotifs] = useState(NOTIFS);

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>›</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>الإشعارات</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>قراءة الكل</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {notifs.map(n => {
          const cfg = TYPE_CONFIG[n.type];
          return (
            <TouchableOpacity
              key={n.id}
              style={[styles.notifRow, !n.read && styles.notifRowUnread]}
              onPress={() => markRead(n.id)}
              activeOpacity={0.8}
            >
              {/* Unread dot */}
              {!n.read && <View style={styles.unreadDot} />}

              {/* Icon */}
              <View style={[styles.iconWrap, { backgroundColor: cfg.color + '20', borderColor: cfg.color + '40' }]}>
                <Text style={styles.notifIcon}>{cfg.icon}</Text>
              </View>

              {/* Text */}
              <View style={styles.notifBody}>
                <Text style={[styles.notifTitle, !n.read && styles.notifTitleUnread]}>{n.title}</Text>
                <Text style={styles.notifText} numberOfLines={2}>{n.body}</Text>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {notifs.every(n => n.read) && (
          <View style={styles.allRead}>
            <Text style={styles.allReadIcon}>✅</Text>
            <Text style={styles.allReadText}>كل الإشعارات مقروءة</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  backIcon: { fontSize: 22, color: Colors.textPrimary, lineHeight: 26 },
  headerCenter: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm },
  title: { fontFamily: 'Cairo_900Black', fontSize: FontSize.xl, color: Colors.textPrimary },
  unreadBadge: {
    backgroundColor: Colors.live, borderRadius: Radius.full,
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
  },
  unreadCount: { fontFamily: 'Cairo_700Bold', fontSize: 10, color: '#fff' },
  markAllText: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.gold },

  notifRow: {
    flexDirection: 'row-reverse', alignItems: 'flex-start', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    position: 'relative',
  },
  notifRowUnread: { backgroundColor: Colors.bgCard },
  unreadDot: {
    position: 'absolute', left: Spacing.md, top: '50%',
    width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.live,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, flexShrink: 0,
  },
  notifIcon: { fontSize: 20 },
  notifBody: { flex: 1, alignItems: 'flex-end', gap: 3 },
  notifTitle: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'right' },
  notifTitleUnread: { color: Colors.textPrimary, fontFamily: 'Cairo_700Bold' },
  notifText: { fontFamily: 'Cairo_400Regular', fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right', lineHeight: 18 },
  notifTime: { fontFamily: 'Cairo_400Regular', fontSize: 10, color: Colors.textMuted },

  allRead: { alignItems: 'center', paddingVertical: 60, gap: Spacing.md },
  allReadIcon: { fontSize: 48 },
  allReadText: { fontFamily: 'Cairo_600SemiBold', fontSize: FontSize.lg, color: Colors.textMuted },
});
