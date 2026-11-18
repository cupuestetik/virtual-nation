import { assetRegistry } from '../../registry/assetRegistry';
import { useEditorStore } from '../../stores/useEditorStore';
import './AssetPicker.css';

/** Simple asset picker for Build Mode */
export function AssetPicker() {
  const setSelectedAsset = useEditorStore((s) => s.setSelectedAsset);
  const selectedAssetId = useEditorStore((s) => s.selectedAssetId);

  const assets = assetRegistry.getAll();

  return (
    <div className="asset-picker">
      {assets.map((asset) => (
        <button
          key={asset.id}
          className={selectedAssetId === asset.id ? 'active' : ''}
          onClick={() => setSelectedAsset(asset.id)}
          type="button"
          title={asset.name}
        >
          {asset.iconName?.toUpperCase() || asset.id}
        </button>
      ))}
    </div>
  );
}
