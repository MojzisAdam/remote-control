<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DataTransformationResourceDaitsu extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'cas' => $this->cas,
            'T1s_z1' => ($this->reg_136 != 255) ? $this->reg_136 : (($this->reg_2 >> 8) & 0xFF),
            'T1s_z2' => ($this->reg_137 != 255) ? $this->reg_137 : ($this->reg_2 & 0xFF),
            'reg_4' => $this->reg_4,
            'reg_100' => $this->reg_100,
            'reg_101' => $this->transformVjedn($this->reg_101),
            'reg_104' => $this->reg_104,
            'reg_105' => $this->reg_105,
            'reg_106' => $this->reg_106,
            'reg_107' => $this->reg_107,
            'reg_108' => $this->reg_108,
            'reg_109' => $this->reg_109,
            'reg_110' => $this->reg_110,
            'reg_111' => $this->reg_111,
            'reg_112' => $this->reg_112,
            'reg_113' => $this->reg_113,
            'reg_115' => $this->reg_115,
            'reg_124' => ($this->reg_124 == 0) ? 0 : -6,
            'reg_128_1' => ($this->reg_128_1 == 0) ? 0 : 4,
            'reg_128_4' => ($this->reg_128_4 == 0) ? 0 : 3,
            'reg_128_6' => ($this->reg_128_6 == 0) ? 0 : 2,
            'reg_129_0' => ($this->reg_129_0 == 0) ? 0 : 5,
            'reg_129_2' => ($this->reg_129_2 == 0) ? 0 : 7,
            'reg_129_13' => ($this->reg_129_13 == 0) ? 0 : 11,
            'reg_129_14' => ($this->reg_129_14 == 0) ? 0 : 9,
            'reg_138' => $this->reg_138,
            'reg_140' => $this->reg_140,
        ];
    }

    protected function transformVjedn($vjedn)
    {
        $mapping = [
            0 => 0,
            2 => 3,
            3 => 5
        ];

        return $mapping[$vjedn] ?? $vjedn;
    }
}