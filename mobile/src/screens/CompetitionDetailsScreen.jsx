/**
 * @file CompetitionDetailsScreen.jsx
 * @description Main screen component for rendering dynamic competition details.
 * 
 * ARCHITECTURE & REUSABILITY:
 * - This screen dynamically consumes data from the backend via the `api.js` service.
 * - Sub-components (like Icons) are decoupled for pure UI rendering.
 * - In a large-scale production app, complex sections (like `JudgeProfile`, `WinnersCarousel`) 
 *   would be extracted into their own modular files. For this assignment, they are structured 
 *   together hierarchically using JSX sections for ease of review.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Share
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { getCompetitionDetails, registerForCompetition } from '../services/api';
import { useCountdown, formatTime } from '../hooks/useCountdown';

// ==========================================
// REUSABLE UI COMPONENTS (Mock Icons)
// ==========================================
// Using icons from img.icons8.com to avoid Android's default cartoony emojis and ensure cross-platform visual parity
const IconImage = ({ src, size = 16, tintColor }) => (
  <Image 
    source={{ uri: src }} 
    style={{ width: size, height: size, tintColor: tintColor, resizeMode: 'contain' }} 
  />
);

const BackIcon = () => <Text style={{ fontSize: 20, color: COLORS.secondary }}>←</Text>;
const CheckIcon = () => <IconImage src="https://img.icons8.com/ios-filled/50/00796B/checkmark--v1.png" size={12} />;
const TrophyIcon = ({ color, size = 14 }) => <IconImage src="https://img.icons8.com/ios-filled/50/000000/trophy.png" size={size} tintColor={color || COLORS.primary} />;
const UsersIcon = () => <IconImage src="https://img.icons8.com/ios-filled/50/00796B/conference-background-selected.png" size={14} />;
const PlayIcon = ({ color = COLORS.white, size = 16 }) => <IconImage src="https://img.icons8.com/ios-filled/50/000000/play.png" size={size} tintColor={color} />;
const HourglassIcon = () => <IconImage src="https://img.icons8.com/ios-filled/50/000000/hourglass.png" size={14} />;
const ClockIcon = () => <IconImage src="https://img.icons8.com/ios-filled/50/00796B/clock.png" size={14} />;
const CalendarIcon = () => <IconImage src="https://img.icons8.com/ios-filled/50/00796B/calendar.png" size={16} />;
const PaperPlaneIcon = () => <IconImage src="https://img.icons8.com/ios-filled/50/00796B/paper-plane.png" size={16} />;
const UploadIcon = () => <IconImage src="https://img.icons8.com/ios-filled/50/00796B/upload.png" size={16} />;
const InfoIcon = () => <IconImage src="https://img.icons8.com/ios-filled/50/00796B/info.png" size={14} />;
const ShieldCheckIcon = () => <IconImage src="https://img.icons8.com/ios-filled/50/000000/security-checked.png" size={14} />;
const MegaphoneIcon = () => <IconImage src="https://img.icons8.com/color/48/megaphone.png" size={24} />;
const ChatIcon = () => <IconImage src="https://img.icons8.com/ios-filled/50/000000/speech-bubble.png" size={16} />;

// Bottom Tab Navigation Icons
const HomeIcon = () => <IconImage src="https://img.icons8.com/ios-filled/50/808080/home.png" size={24} />;
const SearchIcon = () => <IconImage src="https://img.icons8.com/ios-filled/50/808080/search.png" size={24} />;
const AddIcon = () => <Text style={{ fontSize: 24, color: COLORS.white }}>+</Text>;
const ProfileIcon = () => <Image source={{uri: 'https://i.pravatar.cc/150?img=11'}} style={{width: 24, height: 24, borderRadius: 12}} />;

/**
 * @component CompetitionDetailsScreen
 * @description Renders the entire competition lifecycle page, validating state such as capacity, deadlines, and registration.
 */
export default function CompetitionDetailsScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCompetitionDetails();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRegister = async () => {
    if (!data || data.userState.isRegistered) return;
    
    try {
      setRegistering(true);
      await registerForCompetition();
      Alert.alert("Success", "You have successfully registered for the competition!");
      await fetchData();
    } catch (err) {
      Alert.alert("Registration Failed", err.message);
    } finally {
      setRegistering(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Join this awesome competition on Feedants! https://feedants.com/r/referral123',
      });
    } catch (error) {
      console.log('Error sharing:', error.message);
    }
  };

  const timeLeft = useCountdown(data?.competition?.dates?.registrationClose);

  if (loading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { competition, userState } = data;
  const isFull = competition.capacity.bookedSpots >= competition.capacity.totalSpots;
  const isRegistrationClosed = new Date() > new Date(competition.dates.registrationClose);

  let buttonText = 'Register Now';
  let buttonDisabled = registering;
  
  if (userState.isRegistered) {
    buttonText = 'Upload Submission';
    buttonDisabled = true;
  } else if (isRegistrationClosed) {
    buttonText = 'Registration Closed';
    buttonDisabled = true;
  } else if (isFull) {
    buttonText = 'Competition Full';
    buttonDisabled = true;
  }

  // Mock icons for rewards to match the exact image
  const getRewardIcon = (index) => {
    switch(index) {
      case 0: return <IconImage src="https://img.icons8.com/color/48/trophy.png" size={20} />;
      case 1: return <IconImage src="https://img.icons8.com/color/48/medal2.png" size={20} />; // Silver
      case 2: return <IconImage src="https://img.icons8.com/color/48/medal2--v2.png" size={20} />; // Bronze
      default: return <IconImage src="https://img.icons8.com/ios/50/00796B/star--v1.png" size={20} />; // Outline Teal Star
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackIcon />
          <Text style={styles.backText}>Go back</Text>
        </TouchableOpacity>
        <View style={styles.langToggle}>
          <View style={[styles.langPill, styles.langPillActive]}>
            <Text style={styles.langPillTextActive}>ENG</Text>
          </View>
          <View style={styles.langPill}>
            <Text style={styles.langPillText}>हिंदी</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Main Info Card */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{competition.title}</Text>
            {userState.isRegistered && (
              <View style={styles.registeredBadge}>
                <CheckIcon />
                <Text style={styles.registeredText}>Registered</Text>
              </View>
            )}
          </View>

          <View style={styles.tagsRow}>
            {competition.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            <View style={styles.certificateTag}>
              <TrophyIcon size={12} />
              <Text style={styles.certificateText}>Winners get certificate</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Prize Pool</Text>
              <Text style={styles.statValueTeal}>₹ {competition.prizePool.toLocaleString()}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Entry Fee</Text>
              <Text style={styles.statValue}>₹ {competition.entryFee}</Text>
            </View>
            <View style={styles.spotsBox}>
              <View style={styles.spotsRow}>
                <UsersIcon />
                <Text style={styles.spotsLabel}>Only {competition.capacity.totalSpots - competition.capacity.bookedSpots} spots left</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View 
                  style={[styles.progressBarFill, { width: `${(competition.capacity.bookedSpots / competition.capacity.totalSpots) * 100}%` }]} 
                />
              </View>
              <Text style={styles.spotsBooked}>{competition.capacity.bookedSpots} / {competition.capacity.totalSpots} Booked</Text>
            </View>
          </View>
        </View>

        {/* Judge Profile Card */}
        <View style={[styles.card, { paddingVertical: 12 }]}>
          <View style={styles.judgeRow}>
            <Image source={{ uri: competition.judge.image }} style={styles.judgeImage} />
            <View style={styles.judgeInfo}>
              <Text style={styles.judgeLabel}>Judge</Text>
              <Text style={styles.judgeName}>{competition.judge.name}</Text>
              <Text style={styles.judgeDesc}>{competition.judge.title}</Text>
              <Text style={styles.judgeDesc}>{competition.judge.experience}</Text>
            </View>
            <TouchableOpacity style={styles.playBtnContainer}>
              <View style={[styles.playBtnCircle, { backgroundColor: '#E0F2F1' }]}>
                <PlayIcon color={COLORS.primary} size={14} />
              </View>
              <Text style={styles.playBtnText}>Intro Video</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Countdown Timer */}
        {!timeLeft.isPast && (
          <View style={styles.timerBanner}>
            <View style={styles.timerLeft}>
              <HourglassIcon />
              <Text style={styles.timerLabel}>Registration closes in</Text>
            </View>
            <Text style={styles.timerCountdown}>
              {formatTime(timeLeft.days)}d : {formatTime(timeLeft.hours)}h : {formatTime(timeLeft.minutes)}m : {formatTime(timeLeft.seconds)}s
            </Text>
            <View style={styles.timerRight}>
              <ClockIcon />
              <Text style={styles.timerHurry}>Hurry up!</Text>
            </View>
          </View>
        )}

        {/* Important Dates */}
        <View style={styles.datesContainer}>
          <Text style={styles.sectionTitle}>Important Dates</Text>
          <View style={styles.datesCardWrapper}>
            <View style={styles.datesRowTop}>
              <View style={[styles.dateCell, styles.borderRight, styles.borderBottom]}>
                <CalendarIcon />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Register Before</Text>
                  <Text style={styles.dateTeal}>{new Date(competition.dates.registrationClose).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</Text>
                  <Text style={styles.timeText}>{new Date(competition.dates.registrationClose).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
              <View style={[styles.dateCell, styles.borderBottom]}>
                <PaperPlaneIcon />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Submission Starts</Text>
                  <Text style={styles.dateTeal}>{new Date(competition.dates.submissionStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</Text>
                  <Text style={styles.timeText}>{new Date(competition.dates.submissionStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
            </View>
            <View style={styles.datesRowBottom}>
              <View style={[styles.dateCell, styles.borderRight]}>
                <UploadIcon />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Submission Ends</Text>
                  <Text style={styles.dateTeal}>{new Date(competition.dates.submissionEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</Text>
                  <Text style={styles.timeText}>{new Date(competition.dates.submissionEnd).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
              <View style={styles.dateCell}>
                <TrophyIcon size={16} />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Result Date</Text>
                  <Text style={styles.dateTeal}>{new Date(competition.dates.resultDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</Text>
                  <Text style={styles.timeText}>{new Date(competition.dates.resultDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Previous Winners Carousel */}
        <View style={styles.winnersContainer}>
          <Text style={styles.sectionTitle}>Previous Winners</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: SIZES.padding }}>
            {competition.previousWinners.map((winner, idx) => (
              <View key={idx} style={styles.winnerCard}>
                <View style={styles.winnerImageContainer}>
                  <Image source={{ uri: winner.image }} style={styles.winnerImage} />
                  <View style={styles.winnerPlayIcon}>
                    <PlayIcon color={COLORS.primary} size={10} />
                  </View>
                </View>
                <View style={styles.winnerInfo}>
                  <Text style={styles.winnerName} numberOfLines={1}>{winner.name}</Text>
                  <Text style={styles.winnerPosition}>{winner.position}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Tabs section */}
        <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
          <View style={styles.tabsRow}>
            <TouchableOpacity onPress={() => setActiveTab('about')} style={[styles.tab, activeTab === 'about' && styles.activeTab]}>
              <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>About Competition</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('judging')} style={[styles.tab, activeTab === 'judging' && styles.activeTab]}>
              <Text style={[styles.tabText, activeTab === 'judging' && styles.activeTabText]}>Judging Parameters</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('rules')} style={[styles.tab, activeTab === 'rules' && styles.activeTab]}>
              <Text style={[styles.tabText, activeTab === 'rules' && styles.activeTabText]}>Rules & Eligibility</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabContent}>
            {activeTab === 'about' && <Text style={styles.tabContentText}>{competition.tabs.about}</Text>}
            {activeTab === 'judging' && <Text style={styles.tabContentText}>{competition.tabs.judgingParameters}</Text>}
            {activeTab === 'rules' && <Text style={styles.tabContentText}>{competition.tabs.rules}</Text>}
            <TouchableOpacity style={styles.viewMoreBtn}>
              <Text style={styles.viewMoreText}>View more ⌄</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rewards */}
        <View style={styles.rewardsContainer}>
          <Text style={styles.sectionTitle}>Rewards <Text style={{fontSize: 12, color: COLORS.textLight, fontWeight: 'normal'}}>(All Positions)</Text></Text>
          <View style={styles.rewardsCard}>
            {competition.rewards.map((reward, idx) => (
              <View key={idx} style={styles.rewardRow}>
                <View style={styles.rewardLeft}>
                  {getRewardIcon(idx)}
                  <Text style={[styles.rewardPosition, { marginLeft: 16 }]}>{reward.position}</Text>
                </View>
                <Text style={styles.rewardAmount}>₹ {reward.amount}</Text>
              </View>
            ))}
            <View style={styles.disclaimerBox}>
              <InfoIcon />
              <Text style={styles.disclaimerText}><Text style={{fontWeight: 'bold', color: COLORS.primary}}>Disclaimer:</Text> Only contributions from paid participants will be considered for judging.</Text>
            </View>
          </View>
        </View>

        {/* Additional Info Section */}
        <View style={styles.additionalInfoContainer}>
          
          {/* Info Policies Row */}
          <View style={styles.policiesRow}>
            <View style={styles.policyCardLeft}>
              <View style={[styles.playBtnCircle, { backgroundColor: '#E0F2F1', width: 44, height: 44, borderRadius: 8 }]} >
                <PlayIcon color={COLORS.primary} size={16} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.policyTitle}>How will you receive prize money?</Text>
                <Text style={styles.policySub}>Watch video to know more</Text>
              </View>
            </View>
            
            <View style={styles.policyCardRight}>
              <View style={styles.policyItem}>
                <ShieldCheckIcon />
                <Text style={styles.policyItemText}>Refund policy</Text>
              </View>
              <View style={styles.policyItem}>
                <ShieldCheckIcon />
                <Text style={styles.policyItemText}>Secure payments powered by <Text style={{ fontWeight: 'bold' }}>Razorpay</Text></Text>
              </View>
            </View>
          </View>

          {/* Refer & Earn Banner (Exact Layout) */}
          <View style={styles.referCard}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{marginRight: 12}}>
                <MegaphoneIcon />
              </View>
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                  <Text style={styles.referTitle}>Refer & Earn more discount</Text>
                  <TouchableOpacity style={styles.referBtn} onPress={handleShare}>
                    <Text style={styles.referBtnText}>Refer Now</Text>
                  </TouchableOpacity>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <View style={styles.referInputRow}>
                    <TextInput 
                      style={styles.referInput} 
                      value="https://feedants.com/r/referral123" 
                      editable={false} 
                    />
                    <TouchableOpacity style={styles.copyBtn} onPress={handleShare}>
                      <Text style={styles.copyBtnText}>Copy Link</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.referEarnText}>You earn <Text style={{fontWeight: 'bold', color: COLORS.primary}}>₹10</Text> for every signup</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Testimonials */}
          <View style={styles.testimonialCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ChatIcon />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.testimonialTitle}>Hear From Our Users</Text>
                <Text style={styles.testimonialSub}>See what participants say about Feedants</Text>
              </View>
            </View>
            <Text style={{ fontSize: 24, color: COLORS.textLight }}>›</Text>
          </View>

          {/* Ad Placeholder */}
          <View style={styles.adCard}>
            <MegaphoneIcon />
            <Text style={styles.adText}>Ad Here</Text>
          </View>

        </View>

        {/* Spacer for bottom sticky buttons and bottom nav */}
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, buttonDisabled && { opacity: 0.7 }]} 
          onPress={handleRegister}
          disabled={buttonDisabled}
        >
          {registering ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.actionButtonText}>
                {buttonText}
              </Text>
              {userState.isRegistered && (
                <Text style={styles.actionButtonSubtext}>Registered</Text>
              )}
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* App Bottom Nav Mockup */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <HomeIcon />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <SearchIcon />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>
        <View style={styles.navAddBtnContainer}>
          <TouchableOpacity style={styles.navAddBtn}>
            <AddIcon />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.navItem}>
          <TrophyIcon size={24} color={COLORS.primary} />
          <Text style={[styles.navText, {color: COLORS.primary, fontWeight: 'bold'}]}>Competitions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <ProfileIcon />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: SIZES.medium, marginBottom: 10 },
  retryButton: { padding: 10, backgroundColor: COLORS.primary, borderRadius: SIZES.radius },
  retryText: { color: COLORS.white },
  scrollContent: { paddingHorizontal: SIZES.padding, paddingTop: SIZES.padding },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, paddingTop: 10, paddingBottom: 16, backgroundColor: COLORS.white },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8, color: COLORS.secondary },
  langToggle: { flexDirection: 'row', backgroundColor: COLORS.gray, borderRadius: 20, padding: 3 },
  langPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  langPillActive: { backgroundColor: COLORS.primary },
  langPillText: { color: COLORS.secondary, fontSize: 10, fontWeight: 'bold' },
  langPillTextActive: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },

  // Cards
  card: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: SIZES.padding, marginBottom: SIZES.padding, ...SHADOWS.light },
  
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.secondary, flex: 1 },
  registeredBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2F1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#B2DFDB' },
  registeredText: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold', marginLeft: 4 },

  tagsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, flexWrap: 'wrap' },
  tag: { backgroundColor: COLORS.gray, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  tagText: { fontSize: 10, color: COLORS.textLight, fontWeight: '600' },
  certificateTag: { flexDirection: 'row', alignItems: 'center', marginLeft: 4 },
  certificateText: { color: COLORS.primary, fontSize: 11, marginLeft: 4, fontWeight: '600' },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, borderTopWidth: 1, borderTopColor: COLORS.gray, paddingTop: 16 },
  statBox: { flex: 1 },
  statLabel: { fontSize: 10, color: COLORS.textLight, marginBottom: 4, fontWeight: '500' },
  statValueTeal: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  statValue: { fontSize: 22, fontWeight: '900', color: COLORS.secondary },
  spotsBox: { flex: 1.2, alignItems: 'flex-end' },
  spotsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  spotsLabel: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold', marginLeft: 6 },
  progressBarBg: { height: 3, backgroundColor: '#E0E0E0', width: '100%', borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary },
  spotsBooked: { fontSize: 10, color: COLORS.textLight },

  // Judge Profile
  judgeRow: { flexDirection: 'row', alignItems: 'center' },
  judgeImage: { width: 56, height: 56, borderRadius: 28, marginRight: 16 },
  judgeInfo: { flex: 1 },
  judgeLabel: { fontSize: 10, color: COLORS.textLight, marginBottom: 2 },
  judgeName: { fontSize: 14, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 2 },
  judgeDesc: { fontSize: 10, color: COLORS.textLight },
  playBtnContainer: { alignItems: 'center', marginLeft: 10 },
  playBtnCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  playBtnText: { fontSize: 9, color: COLORS.textLight },

  // Timer Banner
  timerBanner: { backgroundColor: '#E0F7FA', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.padding },
  timerLeft: { flexDirection: 'row', alignItems: 'center' },
  timerLabel: { fontSize: 11, color: COLORS.secondary, marginLeft: 6, fontWeight: 'bold' },
  timerCountdown: { fontSize: 14, color: COLORS.primary, fontWeight: '900' },
  timerRight: { flexDirection: 'row', alignItems: 'center' },
  timerHurry: { fontSize: 11, color: COLORS.primary, marginLeft: 4, fontWeight: 'bold' },

  // Dates
  datesContainer: { marginBottom: SIZES.padding },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 12 },
  datesCardWrapper: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0', ...SHADOWS.light, overflow: 'hidden' },
  datesRowTop: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  datesRowBottom: { flexDirection: 'row' },
  dateCell: { flex: 1, flexDirection: 'row', padding: 16, alignItems: 'center' },
  borderRight: { borderRightWidth: 1, borderRightColor: '#F0F0F0' },
  dateInfo: { marginLeft: 12 },
  dateLabel: { fontSize: 10, color: COLORS.textLight, marginBottom: 4 },
  dateTeal: { fontSize: 11, color: COLORS.primary, fontWeight: 'bold', marginBottom: 2 },
  timeText: { fontSize: 11, color: COLORS.secondary, fontWeight: 'bold' },

  // Winners - Horizontally aligned layout
  winnersContainer: { marginBottom: SIZES.padding },
  winnerCard: { flexDirection: 'row', alignItems: 'center', width: 170, marginRight: 12, backgroundColor: COLORS.white, borderRadius: 12, padding: 8, ...SHADOWS.light, marginBottom: 6, borderWidth: 1, borderColor: '#F5F5F5' },
  winnerImageContainer: { position: 'relative', width: 56, height: 56 },
  winnerImage: { width: '100%', height: '100%', borderRadius: 8 },
  winnerPlayIcon: { position: 'absolute', bottom: -4, right: -4, backgroundColor: COLORS.white, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  winnerInfo: { flex: 1, paddingLeft: 12 },
  winnerName: { fontSize: 11, fontWeight: 'bold', color: COLORS.secondary },
  winnerPosition: { fontSize: 9, color: COLORS.primary, marginTop: 4, fontWeight: '600' },

  // Tabs
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.gray },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.primary, marginBottom: -1 },
  tabText: { fontSize: 11, color: COLORS.textLight, fontWeight: '600' },
  activeTabText: { color: COLORS.primary, fontWeight: 'bold' },
  tabContent: { padding: 16 },
  tabContentText: { fontSize: 12, color: COLORS.textLight, lineHeight: 18 },
  viewMoreBtn: { alignItems: 'center', marginTop: 12 },
  viewMoreText: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold' },

  // Rewards
  rewardsContainer: { marginBottom: SIZES.padding },
  rewardsCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: 16, borderWidth: 1, borderColor: '#F5F5F5', ...SHADOWS.light },
  rewardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  rewardLeft: { flexDirection: 'row', alignItems: 'center' },
  rewardPosition: { fontSize: 12, color: COLORS.secondary, fontWeight: 'bold' },
  rewardAmount: { fontSize: 13, color: COLORS.primary, fontWeight: 'bold' },
  disclaimerBox: { flexDirection: 'row', backgroundColor: '#E0F7FA', padding: 12, borderRadius: 8, marginTop: 16, alignItems: 'flex-start' },
  disclaimerText: { fontSize: 10, color: COLORS.textLight, marginLeft: 8, flex: 1, lineHeight: 14 },

  // Additional Info
  additionalInfoContainer: { paddingBottom: 20 },
  policiesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  policyCardLeft: { flex: 0.48, backgroundColor: COLORS.white, padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', ...SHADOWS.light },
  policyCardRight: { flex: 0.48, backgroundColor: COLORS.white, padding: 16, borderRadius: 12, justifyContent: 'center', ...SHADOWS.light },
  policyTitle: { fontSize: 11, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 4 },
  policySub: { fontSize: 9, color: COLORS.textLight },
  policyItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  policyItemText: { fontSize: 9, color: COLORS.secondary, marginLeft: 8, flex: 1 },
  
  // Refer & Earn Card
  referCard: { backgroundColor: '#E4F8ED', padding: 16, borderRadius: 12, marginBottom: 12 },
  referTitle: { fontSize: 11, fontWeight: 'bold', color: COLORS.secondary },
  referInputRow: { flex: 1, marginRight: 12, flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: '#B2DFDB' },
  referInput: { flex: 1, paddingHorizontal: 10, paddingVertical: 4, fontSize: 10, color: COLORS.primary },
  copyBtn: { backgroundColor: COLORS.white, paddingHorizontal: 10, justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: '#B2DFDB' },
  copyBtnText: { fontSize: 10, color: COLORS.primary, fontWeight: 'bold' },
  referEarnText: { fontSize: 9, color: COLORS.primary },
  referBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 6 },
  referBtnText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },

  testimonialCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, ...SHADOWS.light },
  testimonialTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 4 },
  testimonialSub: { fontSize: 10, color: COLORS.textLight },

  adCard: { height: 60, borderWidth: 1, borderStyle: 'dashed', borderColor: '#BDBDBD', borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', backgroundColor: '#FAFAFA' },
  adText: { marginLeft: 8, fontSize: 12, color: COLORS.textLight },

  // Bottom Action
  actionContainer: { position: 'absolute', bottom: 65, left: 0, right: 0, backgroundColor: COLORS.white, paddingHorizontal: SIZES.padding, paddingTop: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: COLORS.gray, zIndex: 10 },
  actionButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: SIZES.radius, alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { color: COLORS.white, fontSize: 14, fontWeight: 'bold' },
  actionButtonSubtext: { color: COLORS.white, fontSize: 10, marginTop: 2 },

  // App Bottom Nav
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 65, backgroundColor: COLORS.white, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.gray, zIndex: 10 },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 9, color: COLORS.textLight, marginTop: 4, fontWeight: '600' },
  navAddBtnContainer: { marginTop: -20 },
  navAddBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium },
});
